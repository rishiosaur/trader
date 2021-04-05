import { App } from '@slack/bolt'
import {
	blocksAndText,
	postEphemeral,
	postEphemeralCurry,
	postEphemeralUserCurry,
	postMessageCurry,
	t
} from '../../shared'
import { createMarketUser } from '../../shared/graphql'

const accountController = (app: App) => {
	app.command(t('/market-create-account'), async ({ ack, body }) => {
		await ack()
		const sayEphemeral = postMessageCurry(body.user_id)
		
		const userCreated = await createMarketUser(body.user_id).then(() => true).catch(() => false)
		
		if (userCreated) {
			await sayEphemeral(...blocksAndText("I've created an account for you. Happy selling!"))
			return;
		} 

		await sayEphemeral(...blocksAndText("Looks like you've already got an account there!"))
	})

	app.command(t('/market-account'), async () => {

	})

	app.command(t('/market-rate'))

	app.command(t('/market-report'))
}

export default accountController
