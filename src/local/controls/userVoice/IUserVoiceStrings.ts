/**
 * @file IUserVoiceStrings.ts
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */

export interface IUserVoiceStrings {
    panel_title: string; // UserVoice panel title
    uservoice_terms_of_service_link_caption: string; // UserVoice Terms of Service
    uservoice_privacy_policy_link_caption: string; // UserVoice Privacy Policy
    fallback_line1: string; // "We couldn't load the feedback tool
    fallback_line2: string; // "The most common cause for this is uservoice.com site being blocked by an organizational policy.
    fallback_line3: string; // "Some things to try:
    fallback_line4: string; // "Go to {0}our forum{1} to post your feedback.
    fallback_line5: string; // "Ask your IT department to allow access to uservoice.com.
    fallback_line6: string; // "Try again later.
    contact_menu_label: string; // Send us a message
    smartvote_menu_label: string; // Help us decide what to add next
    post_suggestion_menu_label: string; // Post your own idea
    contact_title: string; // Send us a message
    smartvote_title: string; // What should we add next?
    satisfaction_message_title: string; // Why did you pick that score?
    post_suggestion_title: string; // Post an Idea
    instant_answers_title: string; // Are any of these helpful?
    contact_details_title: string; // Additional details
    post_suggestion_details_title: string; // Additional details
    smartvote_success_title: string; // Your pick
    contact_message_placeholder: string; // Give feedback or ask for help
    satisfaction_message_placeholder: string; // Enter your feedback
    post_suggestion_message_placeholder: string; // Describe your idea
    suggestion_title_placeholder: string; // Summarize your suggestion
    email_address_placeholder: string; // Email address
    instant_answers_related_suggestions_label: string; // Related ideas
    instant_answers_related_articles_label: string; // Related articles
    suggestion_title_label: string; // Idea title
    suggestion_category_label: string; // Category
    email_address_label: string; // Your email address
    contact_skip_instant_answers_button: string; // Skip and send message
    post_suggestion_skip_instant_answers_button: string; // Skip and post idea
    contact_submit_button: string; // Send message
    post_suggestion_submit_button: string; // Post idea
    smartvote_pick_button: string; // Pick
    smartvote_subscribe_button: string; // Pick + Subscribe
    article_pick_button: string; // This answers my question
    suggestion_subscribe_button: string; // I want this
    suggestion_subscribe_title: string; // Great stuff!
    suggestion_subscribe_body: string; // Do you want updates about this idea?
    suggestion_subscribed_body: string; // We’ll update you as this idea progresses
    contact_confirm_title: string; // Awesome!!!
    contact_confirm_body: string; // Do you still want to send us a message?
    post_suggestion_confirm_title: string; // Okay.
    post_suggestion_confirm_body: string; // Do you still want to submit an idea?
    post_suggestion_success_title: string; // Thank you!
    post_suggestion_success_body: string; // Your feedback has been posted to our %{link:feedback forum}
    contact_success_title: string; // Message sent!
    contact_success_body: string; // We'll be in touch.
    satisfaction_success_title: string; // Thank you!
    satisfaction_success_body: string; // We take your feedback to heart.
    instant_answers_success_title: string; // Thank you!
    instant_answers_success_body: string; // We take your feedback to heart.
    post_suggestion_body: string; // When you post an idea to our feedback forum others will be able to subscribe to it and make comments."
}

export default IUserVoiceStrings;
