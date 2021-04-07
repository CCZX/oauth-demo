const express = require('express');
const { AuthorizationCode } = require('simple-oauth2')

const app = express();

const config = {
  // 这里的id和secret需要在GitHub上申请：https://github.com/settings/applications/new
  client: {
    id: 'client_id',
    secret: 'client_secret'
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize'
  }
}

const client = new AuthorizationCode(config);
const authorizationUri = client.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: 'notifications',
  state: '3(#0/!~'
});

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.get('/auth', (_, res) => {
  res.redirect(authorizationUri)
})

async function getUserInfo(token) {
  const res = await axios({
    method: 'GET',
    url: 'https://api.github.com/user',
    headers: {
      Authorization: `token ${token}`
    }
  })
  return res.data;
}

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  console.log(code);
  // 获取token

  const options = {
    code,
  }

  try {
    const access = await client.getToken(options);
    const resp = await getUserInfo(access.token.access_token);
    return res.status(200).json({
      token: access.token,
      user: resp,
    });
  } catch (error) {
    
  }
})



app.listen(7777, () => {
  console.log('server start')
})
