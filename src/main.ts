import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as os from 'os';
import hbs = require('hbs');


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
  const port = 3000;
  await app.listen(port, '0.0.0.0');

  const paths = ['/painel', '/caixa', '/entrega'];
  const networkAddresses = Object.values(os.networkInterfaces())
    .flatMap((interfaces) => interfaces ?? [])
    .filter((network) => network.family === 'IPv4' && !network.internal)
    .map((network) => network.address);

  console.log(`Aplicacao iniciada na porta ${port}`);
  console.log(`Local: http://localhost:${port}`);
  for (const address of networkAddresses) {
    console.log(`Rede: http://${address}:${port}`);
    for (const route of paths) {
      console.log(`  ${route}: http://${address}:${port}${route}`);
    }
  }
}
bootstrap();
