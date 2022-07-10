const Joi = require('joi')
const queryValidator = Joi.object({
    video_url: Joi.string().required()
})

module.exports = {
    queryValidator
}