import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsMongoId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMongoId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const mongoIdRegex = /^[a-fA-F0-9]{24}$/;
          return mongoIdRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MongoDB ObjectId`;
        },
      },
    });
  };
}

export function IsPlainString(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isPlainString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const dangerousPatterns = [
            /^\$/, // Starts with $ (MongoDB operators)
            /ObjectId\(/, // MongoDB ObjectId constructor
            /\$where/, // Where operator
            /\$function/, // Function operator
            /\$expr/, // Expression operator
            /\{.*\$.*\}/, // Contains $ operators in object
            /\[\$/, // Array with $ operator
          ];
          return !dangerousPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains forbidden characters or patterns`;
        },
      },
    });
  };
}

export function IsSafeHtml(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isSafeHtml',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<embed/i,
            /<object/i,
            /data:/i,
          ];
          return !dangerousPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains potentially dangerous content`;
        },
      },
    });
  };
}

export function IsAlphanumericWithSpaces(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isAlphanumericWithSpaces',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return /^[a-zA-Z0-9\s\-'_.,]+$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must only contain letters, numbers, spaces, hyphens, apostrophes, underscores, periods, and commas`;
        },
      },
    });
  };
}
