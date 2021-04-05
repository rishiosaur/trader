import { App } from '@slack/bolt'
import {
	blocksAndText,
	postEphemeral,
	postEphemeralCurry,
	postEphemeralUserCurry,
	postMessageCurry,
	t,
} from '../../shared'
import { createMarketUser } from '../../shared/graphql'

const accountController = (app: App) => {
	app.command(t('/market-create-account'), async ({ ack, body }) => {
		await ack()
		const sayEphemeral = postMessageCurry(body.user_id)

		const userCreated = await createMarketUser(body.user_id)
			.then(() => true)
			.catch(() => false)

		if (userCreated) {
			await sayEphemeral(
				...blocksAndText(`I've created an account for you. Happy selling! Here's a bunch of stuff that you can do with the Market:
- \`/market-create-order\` - here’s where you can make an order (an order is just a product that you can sell in the market)!
- \`/market-rate-seller\` & \`/market-rate-buyer\` - to ensure quality, everything that goes on in the market goes through checking; if you ever feel like it, make sure to rate your buying or selling experience with other people using these commands!
- \`/market-user <user>\` (example: \`/market-user <@UHFEGV147>\`) - to see the ratings, products sold (and selling), and more information about a person, use this command!
- \`/market-order <id>\` - Oftentimes, the information provided at a glance isn’t enough; use this command to buy a product or view more granular data about it!
For more information, make sure to check <#C01TNJ9NDLH> and the <https://hackclub.slack.com/archives/C0M8PUPU6/p1617634192356300|ship>!`)
			)
			return
		}

		await sayEphemeral(
			...blocksAndText("Looks like you've already got an account there!")
		)
	})
}

export default accountController
