import Joi from 'joi';

export const searchSchema = Joi.object({
  query: Joi.string().required(),
}); 