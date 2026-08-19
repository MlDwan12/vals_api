import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MaxKeywords(
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxKeywords',
      target: object.constructor,
      propertyName,
      constraints: [max],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (value == null || value === '') {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          const maxKeywords = args.constraints[0];

          const keywords = value
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);

          return keywords.length <= maxKeywords;
        },

        defaultMessage(args: ValidationArguments) {
          return `Можно указать не более ${args.constraints[0]} ключевых фраз`;
        },
      },
    });
  };
}
