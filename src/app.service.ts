import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
const data = require('../data.json');
const fs = require('fs');

@Injectable()
export class AppService {
  finalizarPedido(pedido: string) {
    this.remove(data.pronto, +pedido);
  }
  cancelarPedido(pedido: string) {
    this.remove(data.preparando, +pedido);
  }
  prontoPedido(pedido: string) {
    this.remove(data.preparando, +pedido);
    data.pronto.push(+pedido);
  }
  savePedido(pedido: { pedido: string }) {
    let numero = +pedido.pedido;
    if (data.preparando.includes(numero) || data.pronto.includes(numero)) {
      return 'Pedido ja existente!!!';
    }
    data.preparando.push(numero);
    return `Pedido registrado ${numero}`;
  }
  readPedidos(): { pronto: [string]; preparando: [string] } {
    return data;
  }
  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    fs.writeFile('./data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log('Error writing file', err);
      }
    });
  }
  private remove(list: [number], pedido: number) {
    const index = list.indexOf(pedido);
    if (index > -1) {
      list.splice(index, 1);
    }
  }
}
