import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
const data = require('../data.json');
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
    this.remove(data.preparando, pedido);
    data.pronto.push(pedido);
  }
  savePedido(pedido: { pedido: string }) {
    if (
      data.preparando.includes(pedido.pedido) ||
      data.pronto.includes(pedido.pedido)
    ) {
      return 'Pedido ja existente!!!';
    }
    data.preparando.push(`${pedido.pedido}`);
    return `Pedido registrado ${pedido.pedido}`;
  }
  readPedidos(): { pronto: [string]; preparando: [string] } {
    return data;
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    fs.writeFile('./data.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log('Error writing file', err);
      } else {
        console.log('Successfully wrote file');
      }
    });
  }
  private remove(list: [string], pedido: string) {
    const index = list.indexOf(pedido);
    if (index > -1) {
      list.splice(index, 1);
    }
  }
}
