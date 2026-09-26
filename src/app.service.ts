import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PedidoDto } from './pedido.dto';
import * as fs from 'fs';
import * as path from 'path';
import { AppGateway } from './app.gateway';

type DadosPedidos = { pronto: PedidoDto[]; preparando: PedidoDto[] };

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_PATH = path.join(DATA_DIR, 'data.json');
const TEMP_PATH = path.join(DATA_DIR, 'data.json.tmp');
const data: DadosPedidos = readFile();

@Injectable()
export class AppService {
  constructor(private readonly appGateway: AppGateway) { }
  finalizarPedido(pedido: number) {
    this.remove(data.pronto, pedido);
    this.appGateway.wss.emit('finaliza', { pedido });
  }
  cancelarPedido(pedido: number) {
    this.remove(data.preparando, pedido);
    this.appGateway.wss.emit('cancela', { pedido });
  }
  prontoPedido(pedido: number) {
    let pedidoDto = this.find(data.preparando, pedido);
    this.remove(data.preparando, pedido);
    this.add(data.pronto, pedidoDto);
    this.appGateway.wss.emit('pronto', pedidoDto);
  }
  savePedido(pedido: PedidoDto) {
    let numero = pedido.numero;
    if (
      this.isPresent(data.preparando, numero) ||
      this.isPresent(data.pronto, numero)
    ) {
      throw new BadRequestException('Pedido ja existente!!!');
    }
    if (
      !Number.isInteger(numero)
    ) {
      throw new BadRequestException('Numero invalido');
    }
    this.add(data.preparando, pedido);
    this.appGateway.wss.emit('pedido', pedido);
  }
  readPedidos(): { pronto: PedidoDto[]; preparando: PedidoDto[] } {
    return data;
  }
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    let tempFile: number | undefined;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });

      // A gravação ocorre fora do arquivo principal para que ele nunca fique pela metade.
      tempFile = fs.openSync(TEMP_PATH, 'w');
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
      fs.fsyncSync(tempFile);
      fs.closeSync(tempFile);
      tempFile = undefined;

      // No mesmo volume, rename é atômico: o arquivo antigo permanece válido até a troca.
      fs.renameSync(TEMP_PATH, DATA_PATH);
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      if (tempFile !== undefined) {
        try {
          fs.closeSync(tempFile);
        } catch (_) {
          // O erro original é o que deve ser reportado.
        }
      }
      try {
        fs.unlinkSync(TEMP_PATH);
      } catch (_) {
        // O temporário pode já ter sido renomeado ou não existir.
      }
    }
  }
  private remove(list: PedidoDto[], pedido: number): void {
    for (var i = 0; i < list.length; i++) {
      if (list[i].numero == pedido) {
        list.splice(i, 1);
      }
    }
    this.appGateway.wss.emit('all', pedido);
  }
  private add(list: PedidoDto[], pedido: PedidoDto): void {
    if (!this.isPresent(list, pedido.numero)) {
      list.push(pedido);
    }
    this.appGateway.wss.emit('all', pedido);
  }
  private isPresent(list: PedidoDto[], pedido: number): boolean {
    const index = list.find((e) => {
      return e.numero == pedido;
    });
    return index ? true : false;
  }

  private find(list: PedidoDto[], pedido: number): PedidoDto {
    const index = list.find((e) => {
      return e.numero == pedido;
    });
    return index;
  }
}
function readFile(): DadosPedidos {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    if (isDadosPedidos(parsed)) {
      return parsed;
    }
    throw new Error('estrutura de dados inválida');
  } catch (error) {
    console.error('Falha ao carregar arquivo de backup; iniciando vazio:', error);
    return { pronto: [], preparando: [] };
  }
}

function isDadosPedidos(value: unknown): value is DadosPedidos {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const dados = value as { pronto?: unknown; preparando?: unknown };
  return Array.isArray(dados.pronto) && Array.isArray(dados.preparando);
}
