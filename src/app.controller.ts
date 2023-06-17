import { Get, Controller, Render, Post, Body, Put, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }
  @Get('painel')
  @Render('painel')
  root() {
    return this.appService.readPedidos();
  }
  @Get('admin')
  @Render('admin')
  admin() {
    return this.appService.readPedidos();
  }
  @Post('pedido')
  pedido(@Body() pedido: {pedido: string}) {
    return this.appService.savePedido(pedido);
  }
  @Put('pedido/pronto/:pedido')
  pronto(@Param('pedido') pedido: string) {
    return this.appService.prontoPedido(pedido);
  }
  @Put('pedido/cancelar/:pedido')
  cancelar(@Param('pedido') pedido: string) {
    return this.appService.cancelarPedido(pedido);
  }
  @Put('pedido/finalizar/:pedido')
  finalizar(@Param('pedido') pedido: string) {
    return this.appService.finalizarPedido(pedido);
  }
}
