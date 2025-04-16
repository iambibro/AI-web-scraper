import Joi from 'joi';

export const scrapeSchema = Joi.object({
  url: Joi.string().uri().required(),
}); 