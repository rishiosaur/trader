export const genRatingView = (type: string) => (
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
	type: 'modal',
	callback_id: `create_${type.toLowerCase()}_rating`,
	submit: {
		type: 'plain_text',
		text: 'Submit',
		emoji: true,
	},
	close: {
		type: 'plain_text',
		text: 'Cancel',
		emoji: true,
	},
	title: {
		type: 'plain_text',
		text: `${type} Rating form`,
		emoji: true,
	},
	blocks: [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `:wave: Hey there, <@${user}>!\n\nWelcome to the rating form for <@${seller.id}>! Here's where you'll be able to rate someone based on their buying behaviour.`,
			},
		},
		{
			type: 'divider',
		},
		{
			type: 'header',
			text: {
				type: 'plain_text',
				text: 'Current user information',
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
				text: 'Your rating',
				emoji: true,
			},
		},
		{
			type: 'input',
			block_id: 'numeric',
			element: {
				action_id: 'numeric',
				type: 'static_select',
				placeholder: {
					type: 'plain_text',
					text: 'Rate this person from 1-5',
					emoji: true,
				},
				options: [
					{
						text: {
							type: 'plain_text',
							text: '1 - Absolutely terrible experience, would not trust ever',
							emoji: true,
						},
						value: '1',
					},
					{
						text: {
							type: 'plain_text',
							text: '2 - Slightly better than terrible, but still not great.',
							emoji: true,
						},
						value: '2',
					},
					{
						text: {
							type: 'plain_text',
							text:
								"3 - Mediocre. This person wasn't particularly interesting.",
							emoji: true,
						},
						value: '3',
					},
					{
						text: {
							type: 'plain_text',
							text: '4 - Great. You would recommend this person to anyone!',
							emoji: true,
						},
						value: '4',
					},
					{
						text: {
							type: 'plain_text',
							text:
								'5 - Outstanding. This person is the manifestation of  human perfection.',
							emoji: true,
						},
						value: '5',
					},
				],
			},
			label: {
				type: 'plain_text',
				text: 'Numeric rating',
				emoji: true,
			},
		},
		{
			type: 'input',
			block_id: 'description',
			element: {
				type: 'plain_text_input',
				multiline: true,
				action_id: 'description',
				placeholder: {
					type: 'plain_text',
					text:
						"Reasons for your rating. Remember to be constructive—everyone's human.",
					emoji: true,
				},
			},
			label: {
				type: 'plain_text',
				text: 'Description',
				emoji: true,
			},
		},
	],
})

export const buyerRatingView = genRatingView('Buyer')
export const sellerRatingView = genRatingView('Seller')

const genRatedView = (type: string) => (
	rater: string,
	description: string,
	rating: number,
	currentRating: number
) => [
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `Looks like you have a new review for your ${type} behavior!\n Your new rating for ${type} is: *${currentRating}*. This new rating was submitted by <@${rater}>.`,
		},
	},
	{
		type: 'divider',
	},
	{
		type: 'header',
		text: {
			type: 'plain_text',
			text: 'Rating',
			emoji: true,
		},
	},
	{
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: `<@${rater}> rated you a *${rating}* out of 5. Here's why:\n>${description}`,
		},
	},
]

export const buyerRatedView = genRatedView('buying')
export const sellerRatedView = genRatedView('selling')
