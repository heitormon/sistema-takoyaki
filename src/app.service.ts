import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PedidoDto } from './pedido.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
const data: {
  pronto: PedidoDto[];
  preparando: PedidoDto[];
} = require('../data.json');
const fs = require('fs');

@Injectable()
export class AppService {
  finalizarPedido(pedido: string) {
    this.remove(data.pronto, pedido);
  }
  cancelarPedido(pedido: string) {
    this.remove(data.preparando, pedido);
  }
  prontoPedido(pedido: string) {
    let pedidoDto = this.find(data.preparando, pedido);
    this.remove(data.preparando, pedido);
    this.add(data.pronto, pedidoDto);
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
  }
  readPedidos(): { pronto: PedidoDto[]; preparando: PedidoDto[] } {
    return data;
  }
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    fs.writeFile('./data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log('Error writing file', err);
      }
    });
  }
  private remove(list: PedidoDto[], pedido: string): void {
    for (var i = 0; i < list.length; i++) {
      if (list[i].numero === pedido) {
        list.splice(i, 1);
      }
    }
  }
  private add(list: PedidoDto[], pedido: PedidoDto): void {
    if (!this.isPresent(list, pedido.numero)) {
      list.push(pedido);
    }
  }
  private isPresent(list: PedidoDto[], pedido: string): boolean {
    const index = list.find((e) => {
      return e.numero === pedido;
    });
    return index ? true : false;
  }

  private find(list: PedidoDto[], pedido: string): PedidoDto {
    const index = list.find((e) => {
      return e.numero === pedido;
    });
    return index;
  }
}
