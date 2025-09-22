import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PedidoDto } from './pedido.dto';
import * as fs from 'fs';
import { AppGateway } from './app.gateway';
const data: { pronto: PedidoDto[]; preparando: PedidoDto[] } = readFile();

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
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    let dataPath = './data/data.json';
    let tempPath = './data/data.json.tmp';

    try {
      // Escreve em arquivo temporário primeiro
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));

      // Move atomicamente o arquivo temporário para o destino
      fs.renameSync(tempPath, dataPath);
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      // Remove arquivo temporário se houver erro
      fs.unlinkSync(tempPath);
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
function readFile(): { pronto: PedidoDto[]; preparando: PedidoDto[] } {
  if (fs.existsSync('./data/data.json')) {
    try {
      const buffer = fs.readFileSync('./data/data.json');
      return JSON.parse(buffer.toString());
    } catch (error) {
      console.error("Falha ao carregar arquivo de backup")
      return {
        pronto: [],
        preparando: [],
      };
    }

  } else {
    return {
      pronto: [],
      preparando: [],
    };
  }
}
