const fs = require('fs');
const path = 'Auth API Automation Testing.postman_collection.json';
const data = fs.readFileSync(path, 'utf8');
const c = JSON.parse(data);
const newItems = [
    {
        "name": "11. Security Testing - SQL Injection",
        "event": [{ "listen": "test", "script": { "exec": ["pm.test('Should block SQLi (400, 401, or 404)', function() { pm.expect(pm.response.code).to.be.oneOf([400, 401, 404]); });"], "type": "text/javascript" } }],
        "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"email\":\"' OR 1=1 --\",\"password\":\"pass\"}" }, "url": { "raw": "{{base_url}}/auth/login", "host": ["{{base_url}}"], "path": ["auth", "login"] } }
    },
    {
        "name": "12. Security Testing - XSS",
        "event": [{ "listen": "test", "script": { "exec": ["pm.test('Should sanitize XSS', function() { pm.expect(pm.response.text()).to.not.include('<script>'); });"], "type": "text/javascript" } }],
        "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"email\":\"testxss_{{$timestamp}}@a.com\",\"password\":\"Aa1!@#\",\"name\":\"<script>alert(1)</script>\"}" }, "url": { "raw": "{{base_url}}/auth/register/customer", "host": ["{{base_url}}"], "path": ["auth", "register", "customer"] } }
    },
    {
        "name": "13. Rate Limit Testing",
        "event": [
            { "listen": "prerequest", "script": { "exec": ["const req = { url: pm.variables.get('base_url') + '/auth/login', method: 'POST', header: {'Content-Type': 'application/json'}, body: { mode: 'raw', raw: JSON.stringify({email:'a', password:'b'}) } }; for(let i=0; i<55; i++) pm.sendRequest(req, function(e,r){});"], "type": "text/javascript" } },
            { "listen": "test", "script": { "exec": ["pm.test('Status code 429 or Custom 2011', function() { var res = pm.response.json(); pm.expect(res.code).to.eql('2011'); });"], "type": "text/javascript" } }
        ],
        "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"email\":\"a\",\"password\":\"b\"}" }, "url": { "raw": "{{base_url}}/auth/login", "host": ["{{base_url}}"], "path": ["auth", "login"] } }
    },
    {
        "name": "14. Edge Case - Missing Email",
        "event": [{ "listen": "test", "script": { "exec": ["pm.test('Status code is 400', function() { pm.response.to.have.status(400); });"], "type": "text/javascript" } }],
        "request": { "method": "POST", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"password\":\"pass\"}" }, "url": { "raw": "{{base_url}}/auth/register/customer", "host": ["{{base_url}}"], "path": ["auth", "register", "customer"] } }
    },
    {
        "name": "15. Performance Testing",
        "event": [{ "listen": "test", "script": { "exec": ["pm.test('Response time < 800ms', function() { pm.expect(pm.response.responseTime).to.be.below(800); });"], "type": "text/javascript" } }],
        "request": { "method": "GET", "header": [{ "key": "Authorization", "value": "Bearer {{access_token}}" }], "url": { "raw": "{{base_url}}/auth/me", "host": ["{{base_url}}"], "path": ["auth", "me"] } }
    },
    {
        "name": "16. Token Attack - Invalid Signature",
        "event": [{ "listen": "test", "script": { "exec": ["pm.test('Status is 401 Unauthorized', function() { pm.response.to.have.status(401); });"], "type": "text/javascript" } }],
        "request": { "method": "GET", "header": [{ "key": "Authorization", "value": "Bearer {{access_token}}tampered" }], "url": { "raw": "{{base_url}}/auth/me", "host": ["{{base_url}}"], "path": ["auth", "me"] } }
    },
    {
        "name": "17. OTP Security - Invalid OTP",
        "event": [{ "listen": "test", "script": { "exec": ["pm.test('OTP Error 6000', function() { var res = pm.response.json(); pm.expect(res.code).to.eql('6000'); });"], "type": "text/javascript" } }],
        "request": { "method": "POST", "header": [], "url": { "raw": "{{base_url}}/auth/reset-password?email={{test_email}}&otp=000000&newPassword=P@ss12", "host": ["{{base_url}}"], "path": ["auth", "reset-password"], "query": [{ "key": "email", "value": "{{test_email}}" }, { "key": "otp", "value": "000000" }, { "key": "newPassword", "value": "P@ss12" }] } }
    }
];
c.item.push(...newItems);
fs.writeFileSync(path, JSON.stringify(c, null, 4));
console.log('Success JS!');
