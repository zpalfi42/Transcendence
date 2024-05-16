// auth.controller.ts
import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qrcode from 'qrcode';

@Controller('auth')
export class AuthController {
	private authorizationCode: string
	constructor(private readonly configService: ConfigService) { }

	@Post('initiate-oauth')
	initiateOAuth(@Body() body: any): { authorization_url: string } {
		// Handle the initiation of OAuth 
		// const codeVerifier = body.state;
		// console.log("Auth at back in process");
		const apiUid = process.env.apiUid;
		const apiSecret = process.env.apiSecret;
		const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${apiUid}&redirect_uri=${body.redirect_uri}&scope=${body.scope}&response_type=${body.response_type}&state=${body.state}`;
		// const apiUid = process.env.apiUid;
		// console.log("the url is : ", authorizationUrl, "and some idiots is:", type);
		let someurl = new URLSearchParams(authorizationUrl);
		this.authorizationCode = body.code;
		// console.log("wTFocki: body is :---> ", body, "        and  authorizationCode in back is   ", this.authorizationCode);
		return { authorization_url: authorizationUrl };
		//return {authorization_url: body.redirect_uri};
	}


	@Post('finish-oauth')
	async finishOAuth(@Body() body: any): Promise<{ finalResponse: any; }> {
		// Handle the initiation of OAuth 
		// const codeVerifier = body.state;
		// console.log("FINISHHHH at back in process:", body.redirect_uri, "and code idiot!:", body.code);
		const apiUid = process.env.apiUid;
		const apiSecret = process.env.apiSecret;
		const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';
		const requestBody = new URLSearchParams({
			client_id: apiUid,
			client_secret: apiSecret,
			code: body.code,
			redirect_uri: body.redirect_uri,
			grant_type: 'authorization_code',
		});

		let finalresponse;
		try {
			finalresponse = await fetch(tokenEndpoint,
				{
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: requestBody,
				});
			// console.log(" RESPONSE IS --->", finalresponse);
			if (finalresponse.ok) {
				const responseBody = await finalresponse.text();
				const userInfo = JSON.parse(responseBody);

				// console.log(" RESPONSE IS userinfo as:", userInfo)
				return { finalResponse: userInfo };
			}
			else
				throw new Error('Failed to exchange authorization code for access token');
		}
		catch (error) {
			console.error(error);

		}
		// console.log("wTFocki: finalresponse ", finalresponse);
		return { finalResponse: finalresponse };
	}
}
