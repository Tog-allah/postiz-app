import { Injectable, Type, ValidationPipe } from '@nestjs/common';

export type URL = string;

export abstract class VideoAbstract<T> {
  dto: Type<T>;

  async processAndValidate(
    output: 'vertical' | 'horizontal',
    customParams?: T
  ) {
    const validationPipe = new ValidationPipe({
      skipMissingProperties: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });

    const transformed = await validationPipe.transform(customParams, {
      type: 'body',
      metatype: this.dto,
    });

    return this.process(output, transformed);
  }

  protected abstract process(
    output: 'vertical' | 'horizontal',
    customParams?: T
  ): Promise<URL>;
}

export interface VideoParams {
  identifier: string;
  title: string;
  description: string;
  placement: 'text-to-image' | 'image-to-video' | 'video-to-video';
  available: boolean;
  trial: boolean;
}

export function Video(params: VideoParams) {
  return function (target: any) {
    // Apply @Injectable decorator to the target class
    Injectable()(target);

    // Retrieve existing metadata or initialize an empty array
    const existingMetadata = Reflect.getMetadata('video', VideoAbstract) || [];

    // Add the metadata information for this method
    existingMetadata.push({ target, ...params });

    // Define metadata on the class prototype (so it can be retrieved from the class)
    Reflect.defineMetadata('video', existingMetadata, VideoAbstract);
  };
}
