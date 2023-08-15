import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PedidoDto } from './pedido.dto';
const data = require('../data/data.json');
import * as fs from 'fs';
import { AppGateway } from './app.gateway';

@Injectable()
export class AppService {
  constructor(private readonly appGateway: AppGateway) {}
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
    this.add(data.preparando, pedido);
    this.appGateway.wss.emit('pedido', pedido);
  }
  readPedidos(): { pronto: PedidoDto[]; preparando: PedidoDto[] } {
    return data;
  }
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    fs.writeFile('./data/data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log('Error writing file', err);
      }
    });
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
