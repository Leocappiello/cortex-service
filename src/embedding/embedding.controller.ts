import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

interface Input {
  input: string;
}

@Controller('embedding')
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Post('/')
  async test(@Body() body: Input) {
    //this.embeddingService.calculateSimilarity();
    /* this.embeddingService.tokenizeInput(
      'This is an example sentence to try encoding out on!',
    ); */
    //await this.embeddingService.saveEmbeddingInDB();
    const { input } = body;
    const result = await this.embeddingService.getEmbedding(input);
    //console.log(result);
    const embedding = result.data[0].embedding;
    //console.log(embedding);
    await this.embeddingService.saveEmbeddingInDB(input, embedding);
  }

  @Get('/test')
  async testSimilarity(@Body() body: Input) {
    const { input } = body;
    const test =
      'El horario de atencion de la secretaria es de Lunes a Viernes de 1300 a 2000hs';
    const test2 =
      'En la ingenieria en sistemas convergen diversos campos de conocimiento matemática, programación, gestión de datos, software, hardware y redes.';

    const compareOne = await this.embeddingService.provisoryConvert(input);
    const compareTwo = await this.embeddingService.provisoryConvert(test);
    const compareThree = await this.embeddingService.provisoryConvert(test2);

    const resultOne = await this.embeddingService.calculateSimilarity(
      compareOne,
      compareTwo,
    );
    console.log(resultOne, 'primero');
    const resultTwo = await this.embeddingService.calculateSimilarity(
      compareOne,
      compareThree,
    );
    console.log(resultTwo, 'segundo');
    const order = [resultOne, resultTwo].sort();
    console.log(order);
    /* const stringValue = JSON.parse(result);
    console.log(stringValue); */
    /* if (result) {
      const similarity = await this.embeddingService.calculateSimilarity(
        input,
        test,
      );
      const similarityTwo = await this.embeddingService.calculateSimilarity(
        input,
        test2,
      );
      console.log(similarity);
      console.log(similarityTwo);
      return;
    } */
    /*  const resultEmbedding = await this.embeddingService.getEmbedding(input);
    const embedding = resultEmbedding.data[0].embedding;
    await this.embeddingService.saveEmbeddingInDB(input, embedding);
    const similarity = await this.embeddingService.calculateSimilarity(input);
    console.log(similarity);
    return; */
  }
}
