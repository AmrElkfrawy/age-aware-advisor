const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const asyncMiddleware = require('../helpers/async');
const AppError = require('../helpers/appError');
const ageConverter = require('../helpers/ageConverter');

const genAI = new GoogleGenerativeAI(process.env.GRN_AI_API_KEY);

const generationConfig = {
  temperature: 1,
  top_p: 0.95,
  top_k: 0,
  max_output_tokens: 8192,
  response_mime_type: 'application/json',
};
const generationConfigImage = {
  temperature: 1,
  top_p: 0.95,
  top_k: 0,
  max_output_tokens: 8192,
};

const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
];

const fileStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });
exports.uploadUserFile = upload.single('photo');

exports.estimateAge = asyncMiddleware(async (req, res) => {
  const modelResponse = await fetch(
    'https://api-inference.huggingface.co/models/nateraw/vit-age-classifier',
    {
      headers: {
        Authorization: process.env.HF_API_KEY,
      },
      method: 'POST',
      body: req.file.buffer,
    }
  );
  const modelResult = await modelResponse.json();
  if (modelResult.error) {
    res.status(500).json({
      status: 'fail',
      data: {
        result:
          'Our model is currently loading, please try again in a few seconds.',
      },
    });
  }

  const ageGroup = ageConverter(modelResult);

  /*
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro-latest',
    generationConfig,
    safetySettings,
  });
  const prompt = `I made model to estimate my age based on my image. this is my result: \
  ${JSON.stringify(
    modelResult
  )}. Can your convert result to form like Late 20s or Middle 30s. Base on my model result. For example \
  if score of 20-29 is highest and second is 10-19 score is close by .3 you will know if he is early 20s, \
  if score of 20-29 is highest and second is 30-39 score is close by .3 you will know if he is late 20s, \
  if score of 30-39 is highest and no other score is close by .3 you will know if he is middle 30s, \
  continue with the same \
  give me only answer without any other words please.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  */
  res.status(200).json({
    status: 'success',
    data: {
      result: ageGroup,
    },
  });
});

exports.nutrition = asyncMiddleware(async (req, res) => {
  if (req.body.age === 'more than 70') {
    return res.status(200).json({
      status: 'success',
      data: {
        result: 'no suggestion',
      },
    });
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro-latest',
    generationConfig,
    safetySettings,
  });

  const prompt = `Can you suggest healthy food system for ${req.body.age}?. Suggest famous food don't suggest salmon say fish instead.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const resp = JSON.parse(text);
  res.status(200).json({
    status: 'success',
    data: {
      result: resp,
    },
  });
});

exports.foodCalories = asyncMiddleware(async (req, res) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro-vision',
    generationConfig: generationConfigImage,
    safetySettings,
  });

  const prompt = `Can you calculate calories from this food?  \
  make your answer in form of JSON object. first key is name if there is more than one plate mention them with , between names. and second key is estimated calories and its value say the estimated calories and it depends on quantity,\
  third key is description of you how estimated calories. if it's not a food make name 'not a food'\
  Please don't add any other words. and don't change the format because it will not work for me.`;

  const image = {
    inlineData: {
      data: req.file.buffer.toString('base64'),
      mimeType: req.file.mimetype,
    },
  };

  const result = await model.generateContent([prompt, image]);
  const response = await result.response;

  const text = response.text();
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  const jsonRes = JSON.parse(text.substring(startIndex, endIndex + 1));

  console.log(text);
  res.status(200).json({
    status: 'success',
    data: {
      result: jsonRes,
    },
  });
});
