import { App } from '@slack/bolt'
import { gql } from 'graphql-request'
import {
	blocksAndText,
	isUser,
	postEphemeral,
	postEphemeralDMCurry,
	postEphemeralUserCurry,
	postMessage,
	postMessageCurry,
	sendToReviewChannel,
	sendToStreamChannel,
	t,
	unwrapUser,
} from '../../shared'
import { createOfferView } from './views/create'
import { app } from '../../index'
import { addRequest, createOrder, HN, Market } from '../../shared/graphql'
import {
	approvedOrderView,
	rejectedOrderView,
	reviewOfferView,
} from './views/review'
import { marketReviewChannel, token } from '../../config'
import { viewOrderView } from './views/view'
import { approvedRequest, ownerRequest, rejectedRequest } from './views/request'
import {
	buyerRatedView,
	buyerRatingView,
	sellerRatedView,
	sellerRatingView,
} from './views/rating'

const orderController = (app: App) => {
	app.command(t('/market-create-order'), async ({ ack, body, client }) => {
		await ack()

		const triggered = await client.views
			.open({
				trigger_id: body.trigger_id,
				view: createOfferView as any,
			})
			.catch(() => false)

		console.log(triggered)
	})

	app.command(t('/market-user'), async ({ ack, body, client }) => {
		await ack()

		const user = unwrapUser(body.text)

		console.log(user)

		const { user: seller } = await Market.request(
			gql`
				query User($id: String!) {
					user(id: $id) {
						id
						ratings {
							type
						}
						buyingRating
						sellingRating
						selling {
							id
							created
							title
							requests {
								id
							}
							buyer {
								id
							}
							cost
						}
					}
				}
			`,
			{ id: user }
		)

		const { profile }: any = await app.client.users.profile.get({
			user,
			token,
		})

		await client.views.open({
			view: {
				title: {
					type: 'plain_text',
					text: 'View Market User',
					emoji: true,
				},
				type: 'modal',
				close: {
					type: 'plain_text',
					text: 'Close',
					emoji: true,
				},
				blocks: [
					{
						type: 'header',
						text: {
							type: 'plain_text',
							text: 'Profile',
							emoji: true,
						},
					} as any,
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `*${profile.real_name_normalized} (<@${
								seller.id
							}>)*\nBuyer Rating (${
								seller.ratings.filter((z) => z.type === 'Buying').length
							} ratings): ${Array(Math.round(seller.buyingRating))
								.fill('★')
								.join('')} \n Seller Rating (${
								seller.ratings.filter((z) => z.type === 'Selling').length
							} ratings): ${
								Array(Math.round(seller.sellingRating)).fill('★').join('') ||
								'★'
							}\n Rated: ${seller.sellingRating} (S) / ${
								seller.buyingRating
							} (B)`,
						},
						accessory: {
							type: 'image',
							image_url: profile.image_512,
							alt_text: `${seller.name}'s profile picture`,
						},
					},
					{
						type: 'divider',
					},
					{
						type: 'header',
						text: {
							type: 'plain_text',
							text: 'Products',
							emoji: true,
						},
					} as any,
					{
						type: 'context',
						elements: [
							{
								type: 'image',
								image_url: profile.image_512,
								alt_text: 'Profile image',
							},
							{
								type: 'mrkdwn',
								text: "What have they been sellin'?",
							},
						],
					},
					...seller.selling
						.map((order) => [
							{
								type: 'section',
								text: {
									type: 'mrkdwn',
									text: `:package: *Title:* ${order.title}`,
								},
							},
							{
								type: 'section',
								fields: [
									{
										type: 'mrkdwn',
										text: `:clock10: *Created*: ${new Date(
											order.created
										).toLocaleDateString()}`,
									},
									{
										type: 'mrkdwn',
										text: `:take_my_money: *Purchase requests*: ${order.requests.length}`,
									},
									{
										type: 'mrkdwn',
										text: `:money_dinosaur: *Buyer*: ${
											order.buyer ? `<@${order.buyer.id}>` : 'Could be you!'
										}`,
									},
									{
										type: 'mrkdwn',
										text: `:money_mouth_face: *Price* ${order.cost}`,
									},
								],
							},
							{
								type: 'context',
								elements: [
									{
										type: 'mrkdwn',
										text: `To ${
											order.buyer ? 'view' : 'buy'
										} this product, run \`/market-order ${order.id}\``,
									},
								],
							},
							{
								type: 'divider',
							},
						])
						.flat(),
				],
			},
			trigger_id: body.trigger_id,
		})
	})

	app.view('offer_create', async ({ ack, view, body }) => {
		await ack()
		console.log(view.state.values)
		const {
			title: {
				title: { value: title },
			},
			description: {
				description: { value: description },
			},
			price: {
				price: { value: price },
			},
		} = view.state.values

		const user: any = await app.client.users.profile.get({
			user: body.user.id,
			token,
		})

		const { createOrder: order } = await createOrder({
			title,
			description,
			cost: parseInt(price),
			seller: body.user.id,
		})

		const {
			user: { ratings, buyingRating, sellingRating },
		} = await Market.request(
			gql`
				query GetProfile($id: String!) {
					user(id: $id) {
						ratings {
							type
						}

						buyingRating
						sellingRating
					}
				}
			`,
			{ id: body.user.id }
		)

		const x = await sendToReviewChannel(
			reviewOfferView(
				{
					id: order.id,
					title,
					description,
					cost: price,
					created: new Date(),
				},
				{
					id: body.user.id,
					sellingRatingLength: ratings.filter((z) => z.type === 'Selling')
						.length,
					buyingRatingLength: ratings.filter((z) => z.type === 'Buying').length,
					buyingRating,
					sellingRating,
					name: user.profile.real_name_normalized,
					image: user.profile.image_512,
				}
			) as any
		)

		console.log(x)

		await Market.request(
			gql`
				mutation AddReviewTZ($id: ID!, $tz: String!) {
					addReviewTZ(tz: $tz, id: $id) {
						id
					}
				}
			`,
			{
				tz: x.ts,
				id: order.id,
			}
		)

		await postMessage(
			body.user.id,
			...blocksAndText(
				`:wave: Hey there, ${user.profile.real_name_normalized}! Thank you for submitting a product onto the Hack Club Marketplace. To protect against spam, we moderate all of our product requests, so stay tuned for our decision on "${title}"! You'll receive another DM with any updates soon. \n Feel free to DM <@UHFEGV147> at any time for any questions!`
			)
		)
	})

	app.action('approve_order', async ({ body, ack, client }) => {
		await ack()
		const id = (body as any).actions[0].value
		const { approveOrder: order } = await Market.request(
			gql`
				mutation ApproveOrder($id: ID!) {
					approveOrder(order: $id) {
						id
						title
						description
						cost
						created
						seller {
							id
							buyingRating
							sellingRating
						}
						reviewTZ
					}
				}
			`,
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			{ id }
		)

		console.log(new Date(order.created).toLocaleDateString())

		const seller: any = await app.client.users.profile.get({
			user: order.seller.id,
			token,
		})

		const {
			user: { ratings, buyingRating, sellingRating },
		} = await Market.request(
			gql`
				query GetProfile($id: String!) {
					user(id: $id) {
						ratings {
							type
						}

						buyingRating
						sellingRating
					}
				}
			`,
			{ id: order.seller.id }
		)

		await client.chat.update({
			token,
			channel: marketReviewChannel,
			text: 'Approved',
			ts: order.reviewTZ,
			blocks: approvedOrderView(
				{
					...order,
					created: new Date(order.created),
				},
				{
					id: order.seller.id,
					sellingRatingLength: ratings.filter((z) => z.type === 'Selling')
						.length,
					buyingRatingLength: ratings.filter((z) => z.type === 'Buying').length,
					buyingRating,
					sellingRating,
					name: seller.profile.real_name_normalized,
					image: seller.profile.image_512,
				}
			),
		})

		await postMessage(
			order.seller.id,
			...blocksAndText(
				`:tada: Woohoo! "${order.title}" has been approved to go onto the Hack Market! You'll see buying requests pop up in here from time to time, now that your payment process has begun :)`
			)
		)

		await sendToStreamChannel(
			...blocksAndText(
				`:shiba-alert: An exciting new product has landed! Check out "*${order.title}*", sold by <@${order.seller.id}> (S: ${order.seller.sellingRating} / B: ${order.seller.buyingRating})! This product costs ${order.cost}HN. \n>*${order.title}* \n>${order.description}\n\n To buy this, run \`/market-order ${order.id}\``
			)
		)
	})

	app.action('reject_order', async ({ body, ack, client }) => {
		await ack()
		const id = (body as any).actions[0].value
		const { rejectOrder: order } = await Market.request(
			gql`
				mutation RejectOrder($id: ID!) {
					rejectOrder(order: $id) {
						id
						title
						description
						cost
						created
						seller {
							id
							buyingRating
							sellingRating
						}
						reviewTZ
					}
				}
			`,

			// eslint-disable-next-line @typescript-eslint/no-empty-function
			{ id }
		)

		const seller: any = await app.client.users.profile.get({
			user: order.seller.id,
			token,
		})

		const {
			user: { ratings, buyingRating, sellingRating },
		} = await Market.request(
			gql`
				query GetProfile($id: String!) {
					user(id: $id) {
						ratings {
							type
						}

						buyingRating
						sellingRating
					}
				}
			`,
			{ id: order.seller.id }
		)

		await client.chat.update({
			token,
			channel: marketReviewChannel,
			text: 'Rejected',
			ts: order.reviewTZ,
			blocks: rejectedOrderView(
				{
					...order,
					created: new Date(order.created),
				},
				{
					id: order.seller.id,
					sellingRatingLength: ratings.filter((z) => z.type === 'Selling')
						.length,
					buyingRatingLength: ratings.filter((z) => z.type === 'Buying').length,
					buyingRating,
					sellingRating,
					name: seller.profile.real_name_normalized,
					image: seller.profile.image_512,
				}
			),
		})

		await postMessage(
			order.seller.id,
			...blocksAndText(
				`:warning: Oh dear... it looks like your submission, "${order.title}" was rejected from the Hack Market. This isn't the end of the world, though—feel free to submit more products in the future!`
			)
		)
	})

	app.command(t('/market-update-order'))

	// View orders on hand
	app.command(t('/market'), async ({ ack, body, say }) => {
		await ack()

		const { orders: unfiltered } = await Market.request(
			gql`
				# Write your query or mutation here
				query {
					orders(options: { sort: { field: "created", order: Desc } }) {
						id
						title
						cost
						buyer {
							id
						}
						description
						created
						approved
						requests {
							id
						}
						seller {
							id
							buyingRating
							sellingRating
						}
					}
				}
			`
		)

		const orders = unfiltered.filter((z) => z.approved)

		await postMessage(body.channel_id, [
			{
				type: 'header',
				text: {
					type: 'plain_text',
					text: ':shopping_bags:  Market!',
					emoji: true,
				},
			},
			{
				type: 'context',
				elements: [
					{
						type: 'mrkdwn',
						text:
							"Stuff that's on sale right now. :flying_money_with_wings: To buy something, use `/market-view <id>` and click 'Buy'",
					},
				],
			},
			...orders
				.map((order) => [
					{
						type: 'divider',
					},
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `:package: *Product:* ${order.title} `,
						},
					},
					{
						type: 'section',
						fields: [
							{
								type: 'mrkdwn',
								text: `:clock10: *Created*: ${new Date(
									order.created
								).toLocaleDateString()}`,
							},
							{
								type: 'mrkdwn',
								text: `:take_my_money: *Purchase requests*: ${order.requests.length}`,
							},
							{
								type: 'mrkdwn',
								text: `:money_dinosaur: *Buyer*: ${
									order.buyer ? `<@${order.buyer.id}>` : 'Could be you!'
								}`,
							},
							{
								type: 'mrkdwn',
								text: `:money_mouth_face: *Price* ${order.cost}`,
							},
						],
					},
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `Description:\n>${order.description}`,
						},
					},
					{
						type: 'context',
						elements: [
							{
								type: 'mrkdwn',
								text: `Sold by: <@${order.seller.id}> (Buying rating: ${order.seller.buyingRating} / Selling rating: ${order.seller.sellingRating}) - to learn more, run \`/market-user <@${order.seller.id}>\``,
							},
						],
					},
					{
						type: 'context',
						elements: [
							{
								type: 'mrkdwn',
								text: `To buy this product, run \`/market-order ${order.id}\``,
							},
						],
					},
				])
				.flat(),
		])
	})

	// View specific order
	app.command(t(`/market-order`), async ({ ack, body, client }) => {
		await ack()

		const [id] = body.text.split(' ')

		const sayEphemeral = postEphemeralUserCurry(body.channel_id, body.user_id)

		try {
			const { order } = await Market.request(
				gql`
					query Order($id: String!) {
						order(id: $id) {
							id
							description
							title
							cost
							created
							requests {
								id
							}
							buyer {
								id
							}
							seller {
								id
								buyingRating
								sellingRating
								ratings {
									type
								}
							}
						}
					}
				`,
				{ id }
			).catch((z) => {
				console.log(z)
				throw new Error(z)
			})

			const user: any = await app.client.users.profile.get({
				user: order.seller.id,
				token,
			})

			console.log(order.created)
			console.log(new Date(order.created).toLocaleDateString())
			await client.views.open({
				trigger_id: body.trigger_id,
				view: viewOrderView(
					{
						cost: order.cost,
						title: order.title,
						description: order.description,
						buyer: order.buyer ?? undefined,
						id: order.id,
						requests: order.requests,
						created: new Date(order.created),
					},
					{
						id: order.seller.id,
						buyingRating: order.seller.buyingRating,
						sellingRating: order.seller.sellingRating,
						sellingRatingLength: order.seller.ratings.filter(
							(z) => z.type === 'Selling'
						).length,
						buyingRatingLength: order.seller.ratings.filter(
							(z) => z.type === 'Buying'
						).length,
						image: user.profile.image_512,
						name: user.profile.real_name_normalized,
					},
					body.user_id
				) as any,
			})
		} catch (e) {
			console.log(e)
			sayEphemeral(
				...blocksAndText(
					"It looks like that order doesn't exist (yet)! Try a different one, maybe?"
				)
			)
		}
	})

	app.view('request_buy_order', async ({ ack, body, view, context }) => {
		await ack()
		const buyerID = body.user.id
		const order = view.blocks[1].fields[0].text.split('`')[1]

		const { order: entity } = await Market.request(
			gql`
				query Order($id: String!) {
					order(id: $id) {
						title
						id
						seller {
							id
						}
					}
				}
			`,
			{ id: order }
		)

		const postEphemeral = postEphemeralDMCurry(body.user.id)

		try {
			const { user: buyerProfile } = await Market.request(
				gql`
					query Buyer($id: String!) {
						user(id: $id) {
							ratings {
								type
							}

							buyingRating
							sellingRating
							id
						}
					}
				`,
				{ id: body.user.id }
			)

			const sellerProfile: any = await app.client.users.profile.get({
				user: buyerProfile.id,
				token,
			})

			const { ts } = await postMessage(
				entity.seller.id,
				ownerRequest(
					{
						...(buyerProfile as {
							id: string

							buyingRating: number
							sellingRating: number
						}),
						sellingRatingLength: buyerProfile.ratings.filter(
							(z) => z.type === 'Selling'
						).length,
						buyingRatingLength: buyerProfile.ratings.filter(
							(z) => z.type === 'Buying'
						).length,
						image: sellerProfile.profile.image_512,
						name: sellerProfile.profile.real_name_normalized,
					},
					entity,
					buyerID
				)
			)

			const {
				requestPurchase: { seller },
			} = await addRequest({ user: buyerID, order, tz: ts as string })

			await postMessage(
				buyerID,
				...blocksAndText(
					`:tada: Your request to purchase "${entity.title}" has been sent to the buyer, <@${seller.id}>. You'll get another DM with their decision soon.`
				)
			)
		} catch (e) {
			console.log(e)
			await postEphemeral(
				...blocksAndText(
					`Uh oh, something went wrong when requesting a purchase. Maybe you don't have an account on the market?`
				)
			)
		}
	})

	app.action('approve_request', async ({ ack, action, body, client }) => {
		await ack()
		console.log(body)
		console.log(action)
		const [order, buyer] = (action as any).value.split(' | ') as [
			string,
			string
		]

		const { order: entity } = await Market.request(
			gql`
				query Order($id: String!) {
					order(id: $id) {
						title
						id
						seller {
							id
						}
						requestTZs {
							tz
							id
						}
					}
				}
			`,
			{ id: order }
		)

		try {
			const { approvePurchaseRequest: approvedEntity } = await Market.request(
				gql`
					mutation Z($order: ID!, $user: ID!) {
						approvePurchaseRequest(user: $user, order: $order) {
							id
						}
					}
				`,
				{ order, user: buyer }
			)

			const { user: buyerProfile } = await Market.request(
				gql`
					query Buyer($id: String!) {
						user(id: $id) {
							ratings {
								type
							}

							buyingRating
							sellingRating
							id
						}
					}
				`,
				{ id: buyer }
			)

			const buyerSlackProfile: any = await app.client.users.profile.get({
				user: buyerProfile.id,
				token,
			})

			// await Promise.all(entity.requestTZs.map(({ id, tz }: { id: string, tz: string }) => {
			// 	console.log(tz)
			// 	console.log(entity.seller.id)
			// 	client.chat.update({
			// 		channel: entity.seller.id,
			// 		ts: tz,
			// 		token,
			// 		blocks: id === buyer ? approvedRequest({
			// 			...buyerProfile as {
			// 				id: string,
			//
			// 				buyingRating: number,
			// 				sellingRating: number,
			// 			},
			// 			sellingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Selling').length,
			// 			buyingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Buying').length,
			// 			image: buyerSlackProfile.profile.image_512,
			// 			name: buyerSlackProfile.profile.real_name_normalized
			// 		}, entity, buyer) : rejectedRequest({
			// 			...buyerProfile as {
			// 				id: string,
			//
			// 				buyingRating: number,
			// 				sellingRating: number,
			// 			},
			// 			sellingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Selling').length,
			// 			buyingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Buying').length,
			// 			image: buyerSlackProfile.profile.image_512,
			// 			name: buyerSlackProfile.profile.real_name_normalized
			// 		}, entity, buyer),
			// 		text: id === buyer ? 'Approved Request' : 'Rejected Request'
			// 	})
			// }))

			const { generateInvoice: transaction } = await Market.request(
				gql`
					mutation GenInvoice($order: ID!) {
						generateInvoice(order: $order)
					}
				`,
				{ order }
			)

			await postMessage(
				entity.seller.id,
				...blocksAndText(
					`:moneybag: Congratulations! Your product, "${entity.title}" has been sold to <@${buyer}>! I've generated a transaction on the HN payment system with the ID \`${transaction}\`. As soon as it's been paid, you'll get a DM. \n\n To rate <@${buyer}> as a buyer, make sure to use the \`/market-rate-buyer\` command. Make sure to get in touch with them!~`
				)
			)

			await postMessage(
				buyer,
				...blocksAndText(
					`Woot woot! You are now the proud owner of "${entity.title}", sold by the wonderful <@${entity.seller.id}>. Make sure to pay the invoice by running \`/pay ${transaction}\`; you can (and probably will) be rated as a buyer!\n\n To rate the selling experience from <@${entity.seller.id}>, you can use the \`/market-rate-seller\` command. Make sure to get in touch with them!`
				)
			)

			await sendToStreamChannel(
				...blocksAndText(
					`:tada: "${entity.title}" has been sold to <@${buyer}> for ${entity.cost}HN!`
				)
			)
		} catch (e) {
			console.log(e)
			await postEphemeral(
				entity.seller.id,
				entity.seller.id,
				...blocksAndText(
					`I ran into a weird issue when trying to approve your approval for the sale of "${entity.title}". Please contact <@UHFEGV147> to nab some help.`
				)
			)
		}
	})

	app.action('reject_request', async ({ ack, action, client }) => {
		await ack()

		const [order, buyer] = (action as any).value.split(' | ') as [
			string,
			string
		]

		const { order: entity } = await Market.request(
			gql`
				query Order($id: String!) {
					order(id: $id) {
						title
						id
						seller {
							id
						}
					}
				}
			`,
			{ id: order }
		)

		try {
			await Market.request(
				gql`
					mutation RejectRequest($user: ID!, $order: ID!) {
						removePurchaseRequest(user: $user, order: $order) {
							id
							description
						}
					}
				`,
				{
					order,
					user: buyer,
				}
			)

			const { user: buyerProfile } = await Market.request(
				gql`
					query Buyer($id: String!) {
						user(id: $id) {
							ratings {
								type
							}

							buyingRating
							sellingRating
							id
						}
					}
				`,
				{ id: buyer }
			)

			const buyerSlackProfile: any = await app.client.users.profile.get({
				user: buyerProfile.id,
				token,
			})

			// await Promise.all(entity.requestTZs.map(({ id, tz }: { id: string, tz: string }) => client.chat.update({
			// 	channel: entity.seller.id,
			// 	ts: tz,
			// 	token,
			// 	blocks: id === buyer ? rejectedRequest({
			// 		...buyerProfile as {
			// 			id: string,
			//
			// 			buyingRating: number,
			// 			sellingRating: number,
			// 		},
			// 		sellingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Selling').length,
			// 		buyingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Buying').length,
			// 		image: buyerSlackProfile.profile.image_512,
			// 		name: buyerSlackProfile.profile.real_name_normalized
			// 	}, entity, buyer) : approvedRequest({
			// 		...buyerProfile as {
			// 			id: string,
			//
			// 			buyingRating: number,
			// 			sellingRating: number,
			// 		},
			// 		sellingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Selling').length,
			// 		buyingRatingLength: buyerProfile.ratings.filter(z => z.type === 'Buying').length,
			// 		image: buyerSlackProfile.profile.image_512,
			// 		name: buyerSlackProfile.profile.real_name_normalized
			// 	}, entity, buyer),
			// 	text: id === buyer ? 'Rejected Request' : 'Approved Request'
			// })))

			await postMessage(
				buyer,
				...blocksAndText(
					`It looks like your request to purchase "${entity.title}" has been rejected by the seller, <@${entity.seller.id}>. `
				)
			)
		} catch (e) {
			console.log(e)
		}
	})

	app.command(t('/market-rate-buyer'), async ({ ack, body, client }) => {
		await ack()

		if (!isUser(body.text)) {
			return
		}

		const user = unwrapUser(body.text)

		// TODO: check if rating person and other person is the same
		try {
			const { user: profile } = await Market.request(
				gql`
					query Buyer($id: String!) {
						user(id: $id) {
							ratings {
								type
							}

							buyingRating
							sellingRating
							id
						}
					}
				`,
				{ id: user }
			)

			const sellerProfile: any = await app.client.users.profile.get({
				user,
				token,
			})

			await client.views.open({
				trigger_id: body.trigger_id,
				view: buyerRatingView(
					{
						...(profile as {
							id: string

							buyingRating: number
							sellingRating: number
						}),
						sellingRatingLength: profile.ratings.filter(
							(z) => z.type === 'Selling'
						).length,
						buyingRatingLength: profile.ratings.filter(
							(z) => z.type === 'Buying'
						).length,
						image: sellerProfile.profile.image_512,
						name: sellerProfile.profile.real_name_normalized,
					},
					user
				) as any,
			})
		} catch (e) {
			console.log(e)
		}
	})

	app.view('create_buyer_rating', async ({ ack, view, body }) => {
		await ack()
		const from = body.user.id
		const ratingFor = body.view.blocks[0].text.text
			.split('for ')[1]
			.split('! ')[0]
			.trim()
			.substring(2)
			.slice(0, -1)
		const {
			numeric: { numeric: x },
			description: {
				description: { value: description },
			},
		} = view.state.values
		const numeric = x.selected_option.value
		const { addRating: newUser } = await Market.request(
			gql`
				mutation AddRating(
					$for: String!
					$from: String!
					$description: String!
					$rating: Int!
				) {
					addRating(
						object: {
							type: Buying
							description: $description
							for: $for
							from: $from
							rating: $rating
						}
					) {
						id
						buyingRating
					}
				}
			`,
			{
				for: ratingFor,
				from,
				description,
				rating: parseInt(numeric),
			}
		)

		await postMessage(
			ratingFor,
			buyerRatedView(from, description, numeric, newUser.buyingRating)
		)
	})

	app.command(t('/market-rate-seller'), async ({ ack, body, client }) => {
		await ack()

		if (!isUser(body.text)) {
			return
		}

		const user = unwrapUser(body.text)

		// TODO: check if rating person and other person is the same
		try {
			const { user: profile } = await Market.request(
				gql`
					query Buyer($id: String!) {
						user(id: $id) {
							ratings {
								type
							}

							buyingRating
							sellingRating
							id
						}
					}
				`,
				{ id: user }
			)

			const sellerProfile: any = await app.client.users.profile.get({
				user,
				token,
			})

			await client.views.open({
				trigger_id: body.trigger_id,
				view: sellerRatingView(
					{
						...(profile as {
							id: string

							buyingRating: number
							sellingRating: number
						}),
						sellingRatingLength: profile.ratings.filter(
							(z) => z.type === 'Selling'
						).length,
						buyingRatingLength: profile.ratings.filter(
							(z) => z.type === 'Buying'
						).length,
						image: sellerProfile.profile.image_512,
						name: sellerProfile.profile.real_name_normalized,
					},
					user
				) as any,
			})
		} catch (e) {
			console.log(e)
		}
	})

	app.view('create_seller_rating', async ({ ack, view, body }) => {
		await ack()
		const from = body.user.id
		const ratingFor = body.view.blocks[0].text.text
			.split('for ')[1]
			.split('! ')[0]
			.trim()
			.substring(2)
			.slice(0, -1)
		const {
			numeric: { numeric: x },
			description: {
				description: { value: description },
			},
		} = view.state.values
		const numeric = x.selected_option.value
		const { addRating: newUser } = await Market.request(
			gql`
				mutation AddRating(
					$for: String!
					$from: String!
					$description: String!
					$rating: Int!
				) {
					addRating(
						object: {
							type: Selling
							description: $description
							for: $for
							from: $from
							rating: $rating
						}
					) {
						id
						buyingRating
					}
				}
			`,
			{
				for: ratingFor,
				from,
				description,
				rating: parseInt(numeric),
			}
		)

		await postMessage(
			ratingFor,
			sellerRatedView(from, description, numeric, newUser.buyingRating)
		)
	})
}

export default orderController
