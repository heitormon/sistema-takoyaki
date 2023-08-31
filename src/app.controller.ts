import { Get, Controller, Render, Post, Body, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { PedidoDto } from './pedido.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('painel')
  @Render('painel')
  painel() {
    const rowsNumber = process.env.ROWS_NUMBER || 6;
    const colNumber = process.env.COL_NUMBER || 3;
    return{
      rowsNumber,
      colNumber
    }
  }
  @Get('caixa')
  @Render('caixa')
  caixa() {
  }
  @Get('entrega')
  @Render('entrega')
  entrega() {
  }
  @Post('pedido')
  pedido(@Body() pedido: PedidoDto) {
    return this.appService.savePedido(pedido);
  }
  @Put('pedido/pronto')
  pronto(@Body() pedido: { numero: number }) {
    return this.appService.prontoPedido(pedido.numero);
  }
  @Put('pedido/cancelar')
  cancelar(@Body() pedido: { numero: number }) {
    return this.appService.cancelarPedido(pedido.numero);
  }
  @Put('pedido/finalizar')
  finalizar(@Body() pedido: { numero: number }) {
    return this.appService.finalizarPedido(pedido.numero);
  }
  @Get('pedidos')
  pedidos() {
    return this.appService.readPedidos();
  }
}
