import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
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
  const publicHost = process.env.PUBLIC_HOST?.trim();

  console.log(`Aplicacao iniciada na porta ${port}`);
  console.log(`Local: http://localhost:${port}`);
  if (publicHost) {
    console.log(`Rede: http://${publicHost}:${port}`);
    for (const route of paths) {
      console.log(`  ${route}: http://${publicHost}:${port}${route}`);
    }
  } else {
    console.log('Rede: defina PUBLIC_HOST com o IP da Wi-Fi do computador');
  }
}
bootstrap();
