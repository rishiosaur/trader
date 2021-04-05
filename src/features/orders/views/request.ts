export const ownerRequest = (
	seller: {
		id: string
		name: string
		buyingRating: number
		buyingRatingLength: number
		sellingRating: number
		sellingRatingLength: number
		image: string
	},
	order: {
		id: string
		title: string
	},
	buyer: string
) => [
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `*New request to purchase "${order.title}" from <@${buyer}>!*`,
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
				value: `${order.id} | ${buyer}`,
				action_id: 'approve_request',
			},
			{
				type: 'button',
				text: {
					type: 'plain_text',
					emoji: true,
					text: 'Reject',
				},
				style: 'danger',
				value: `${order.id} | ${buyer}`,
				action_id: 'reject_request',
			},
		],
	},
]

export const approvedRequest = (
	seller: {
		id: string
		name: string
		buyingRating: number
		buyingRatingLength: number
		sellingRating: number
		sellingRatingLength: number
		image: string
	},
	order: {
		id: string
		title: string
	},
	buyer: string
) => [
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `*New request to purchase "${order.title}" from <@${buyer}>!*`,
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
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `:white_check_mark: Approved!`,
		},
	},
]

export const rejectedRequest = (
	seller: {
		id: string
		name: string
		buyingRating: number
		buyingRatingLength: number
		sellingRating: number
		sellingRatingLength: number
		image: string
	},
	order: {
		id: string
		title: string
	},
	buyer: string
) => [
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `*New request to purchase "${order.title}" from <@${buyer}>!*`,
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
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `:x: Rejected!`,
		},
	},
]
