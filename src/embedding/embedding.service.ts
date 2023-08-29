import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import similarity = require('compute-cosine-similarity');
//import encoder = require('gpt-3-encoder');
import { AxiosError } from 'axios';
import GPT4Tokenizer from 'gpt4-tokenizer';
import { catchError, firstValueFrom } from 'rxjs';
import { createKey, getKey, setClient, start } from 'src/redis/redis';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    setClient(this.configService.get('REDIS'));
    start();
  }

  TOKEN_OPEN_AI = this.configService.get('OPENAI_TOKEN');
  MAX_TOKEN_LIMIT = this.configService.get('MAX_TOKEN_LIMIT');

  tokenizeInput(input: string): number {
    /* const encodedInput = encoder.encode(input);
    console.log('Encoded this string looks like: ', encodedInput);

    console.log('We can look at each token and what it represents');
    for (const token of encodedInput) {
      console.log({ token, string: encoder.decode([token]) });
    }

    const decoded = encoder.decode(encodedInput);
    console.log('We can decode it back into:\n', decoded); */
    const tokenizer = new GPT4Tokenizer({ type: 'gpt3' });
    return tokenizer.estimateTokenCount(input);
  }

  async getEmbedding(input: string) {
    if (this.tokenizeInput(input) < this.MAX_TOKEN_LIMIT) {
      try {
        const result = await firstValueFrom(
          this.httpService
            .post(
              'https://api.openai.com/v1/embeddings',
              {
                input,
                model: 'text-embedding-ada-002',
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.TOKEN_OPEN_AI}`,
                },
              },
            )
            .pipe(
              catchError((error: AxiosError) => {
                console.log(error.response.data);
                throw 'Error getting Embedding';
              }),
            ),
        );
        if (result.status == 200) {
          return result.data;
        } else {
          return false;
        }
      } catch (error) {
        console.log('Error', error);
      }
    }
    return false;
  }

  async saveEmbeddingInDB(key, value) {
    await createKey(key, value);
  }

  async calculateSimilarity(input, inputToCompare) {
    try {
      const result = similarity(input, inputToCompare);
      return result;
    } catch (error) {
      console.log('Error calculating similarity');
      console.log(error);
    }
  }

  async getKeysRedis(input) {
    const key = await getKey(input);
    return key;
  }

  async provisoryConvert(input) {
    const result = await this.getKeysRedis(input);
    const parse = JSON.parse(result);

    if (parse) {
      const stringValue = parse.stringValue;
      const numbers = Array.from(stringValue.split(','));
      const newNumbers = [];

      for (let number of numbers) {
        number = Number(number);
        newNumbers.push(number);
      }
      return newNumbers;
    }
    /* const numbers = Array.from(stringValue.split(','));
    const newNumbers = [];

    for (let number of numbers) {
      number = Number(number);
      newNumbers.push(number);
    }
    return newNumbers; */
  }
}
