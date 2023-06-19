import {
  Get,
  Controller,
  Render,
  Post,
  Body,
  Put,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PedidoDto } from './pedido.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('painel')
  @Render('painel')
  painel() {
    const pedidos = this.appService.readPedidos();
    return {
      pronto: JSON.stringify(pedidos.pronto),
      preparando: JSON.stringify(pedidos.preparando),
    };
  }
  @Get('caixa')
  @Render('caixa')
  caixa() {
    return this.appService.readPedidos();
  }
  @Get('entrega')
  @Render('entrega')
  entrega() {
    return this.appService.readPedidos();
  }
  @Post('pedido')
  pedido(@Body() pedido: PedidoDto) {
    return this.appService.savePedido(pedido);
  }
  @Put('pedido/pronto')
  pronto(@Body() pedido: {numero: string}) {
    return this.appService.prontoPedido(pedido.numero);
  }
  @Put('pedido/cancelar')
  cancelar(@Body() pedido:  {numero: string}) {
    return this.appService.cancelarPedido(pedido.numero);
  }
  @Put('pedido/finalizar')
  finalizar(@Body() pedido:  {numero: string}) {
    return this.appService.finalizarPedido(pedido.numero);
  }
}
