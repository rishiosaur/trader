export const viewOrderView = (
	order: {
		id: string
		title: string
		description: string
		cost: number
		buyer?: {
			id: string
		}
		requests: {
			id: string
		}[]
		created: Date
	},
	seller: {
		id: string
		name: string
		buyingRating: number
		buyingRatingLength: number
		sellingRating: number
		sellingRatingLength: number
		image: string
	},
	user: string
) => ({
	title: {
		type: 'plain_text',
		text: `View order`,
	},
	type: 'modal',
	blocks: [
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: order.title,
				emoji: true,
			},
		},
		{
			type: 'section',
			block_id: 'fields',
			fields: [
				{
					type: 'mrkdwn',
					text: `*ID*: \`${order.id}\``,
				},
				{
					type: 'mrkdwn',
					text: `*Created*: ${order.created.toLocaleDateString()}`,
				},
				{
					type: 'mrkdwn',
					text: `*Seller*: <@${seller.id}>`,
				},
			],
		},
		{
			type: 'divider',
		},
		{
			type: 'header',
			text: {
				type: 'plain_text',
				text: 'Seller information',
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `*${seller.name} (<@${seller.id}>)*\nBuyer Rating (${
					seller.buyingRatingLength
				} ratings): ${Array(Math.round(seller.buyingRating))
					.fill('★')
					.join('')} \n Seller Rating (${
					seller.sellingRatingLength
				} ratings): ${
					Array(Math.round(seller.sellingRating)).fill('★').join('') || '★'
				}\n Rated: ${seller.sellingRating} (S) / ${seller.buyingRating} (B)`,
			},
			accessory: {
				type: 'image',
				image_url: seller.image,
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
				text: 'Product information',
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: 'Description',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: order.description,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: 'Price',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: order.cost.toString(),
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: order.buyer
					? `Bought by <@${order.buyer.id}>`
					: 'Available for purchase',
			},
		},
	],
	...(!order.buyer && {
		submit:
			!order.buyer &&
			(!order.requests.map((z) => z.id).includes(user)
				? {
						type: 'plain_text',
						emoji: true,
						text: ':white_check_mark: Buy',
				  }
				: {
						type: 'plain_text',
						emoji: true,
						text: ':x: Remove request',
				  }),
		callback_id:
			!order.buyer &&
			(!order.requests.map((z) => z.id).includes(user)
				? 'request_buy_order'
				: 'remove_buy_request'),
	}),
})
