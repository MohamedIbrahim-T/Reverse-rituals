require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

console.log('API Key length:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 'MISSING');
console.log('Starts with xkeysib- ?', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.startsWith('xkeysib-') : false);

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.AccountApi();
apiInstance.getAccount().then(function(data) {
  console.log('✅ Brevo Account details fetched successfully. Email is working!');
  console.log('Account Plan:', data.plan);
}, function(error) {
  console.error('❌ Brevo API Error:', error.response ? error.response.text : error.message);
});
