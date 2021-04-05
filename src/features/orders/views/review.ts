export const reviewOfferView = (
	order: {
		id: string
		title: string
		description: string
		cost: number
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
	}
) => [
	{
		type: 'header',
		text: {
			type: 'plain_text',
			text: 'New order comin thru!',
			emoji: true,
		},
	},
	{
		type: 'section',
		text: {
			type: 'plain_text',
			text: "Here's some useful informations:",
			emoji: true,
		},
	},
	{
		type: 'section',
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
				.join('')} \n Seller Rating (${seller.sellingRatingLength} ratings): ${
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
			text: `*Title*: (character count \`${order.title.length}\` chars)`,
		},
	},
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: order.title,
		},
	},
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: '*Description*',
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
			text: '*Price*',
		},
	},
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `${order.cost  }HN`,
		},
	},
	{
		type: 'actions',
		elements: [
			{
				type: 'button',
				text: {
					type: 'plain_text',
					emoji: true,
					text: 'Approve',
				},
				style: 'primary',
				value: order.id,
				action_id: 'approve_order',
			},
			{
				type: 'button',
				text: {
					type: 'plain_text',
					emoji: true,
					text: 'Deny',
				},
				style: 'danger',
				value: order.id,
				action_id: 'reject_order',
			},
		],
	},
]

export const rejectedOrderView = (
	order: {
		id: string
		title: string
		description: string
		cost: number
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
	}
) => [
	{
		type: 'header',
		text: {
			type: 'plain_text',
			text: 'New order comin thru!',
			emoji: true,
		},
	},
	{
		type: 'section',
		text: {
			type: 'plain_text',
			text: "Here's some useful informations:",
			emoji: true,
		},
	},
	{
		type: 'section',
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
				.join('')} \n Seller Rating (${seller.sellingRatingLength} ratings): ${
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
			text: `*Title*: (character count \`${order.title.length}\` chars)`,
		},
	},
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: order.title,
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
			text: `:x: Rejected!`,
		},
	},
]
export const approvedOrderView = (
	order: {
		id: string
		title: string
		description: string
		cost: number
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
	}
) => [
	{
		type: 'header',
		text: {
			type: 'plain_text',
			text: 'New order comin thru!',
			emoji: true,
		},
	},
	{
		type: 'section',
		text: {
			type: 'plain_text',
			text: "Here's some useful informations:",
			emoji: true,
		},
	},
	{
		type: 'section',
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
				.join('')} \n Seller Rating (${seller.sellingRatingLength} ratings): ${
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
			text: `*Title*: (character count \`${order.title.length}\` chars)`,
		},
	},
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: order.title,
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
			text: `:white_check_mark: Approved!`,
		},
	},
]
