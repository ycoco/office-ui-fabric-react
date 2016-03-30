/**
 * @file UserVoiceStringsOverride.tsx
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */
import StringHelper = require('odsp-shared/utilities/string/StringHelper');

class UserVoiceStringsOverride {

    public panel_title: string = "(tbl) panel_title";
    public uservoice_terms_of_service_link_caption: string = "(tbl) UserVoice Terms of Service";
    public uservoice_privacy_policy_link_caption: string = "(tbl) UserVoice Privacy Policy";

    public fallback_line1: string = ""; // "We couldn't load the feedback tool";
    public fallback_line2: string = ""; // "The most common cause for this is uservoice.com site being blocked by an organizational policy.";
    public fallback_line3: string = ""; // "Some things to try:";
    public fallback_line4: string = ""; // "Go to {0}our forum{1} to post your feedback.";
    public fallback_line5: string = ""; // "Ask your IT department to allow access to uservoice.com.";
    public fallback_line6: string = ""; // "Try again later.";

    public contact_menu_label: string = null; //(tbl)Send us a message";
    public smartvote_menu_label: string = null; //(tbl)Help us decide what to add next";
    public post_suggestion_menu_label: string = null; //(tbl)Post your own idea";
    public contact_title: string = null; //(tbl)Send us a message";
    public smartvote_title: string = null; //(tbl)What should we add next?";
    public satisfaction_message_title: string = null; //(tbl)Why did you pick that score?";
    public post_suggestion_title: string = null; //(tbl)Post an Idea";
    public instant_answers_title: string = null; //(tbl)Are any of these helpful?";
    public contact_details_title: string = null; //(tbl)Additional details";
    public post_suggestion_details_title: string = null; //(tbl)Additional details";
    public smartvote_success_title: string = null; //(tbl)Your pick";
    public contact_message_placeholder: string = null; //(tbl)Give feedback or ask for help";
    public satisfaction_message_placeholder: string = null; //(tbl)Enter your feedback";
    public post_suggestion_message_placeholder: string = null; //(tbl)Describe your idea";
    public suggestion_title_placeholder: string = null; //(tbl)Summarize your suggestion";
    public email_address_placeholder: string = null; //(tbl)Email address";
    public instant_answers_related_suggestions_label: string = null; //(tbl)Related ideas";
    public instant_answers_related_articles_label: string = null; //(tbl)Related articles";
    public suggestion_title_label: string = null; //(tbl)Idea title";
    public suggestion_category_label: string = null; //(tbl)Category";
    public email_address_label: string = null; //(tbl)Your email address";
    public contact_skip_instant_answers_button: string = null; //(tbl)Skip and send message";
    public post_suggestion_skip_instant_answers_button: string = null; //(tbl)Skip and post idea";
    public contact_submit_button: string = null; //(tbl)Send message";
    public post_suggestion_submit_button: string = null; //(tbl)Post idea";
    public smartvote_pick_button: string = null; //(tbl)Pick";
    public smartvote_subscribe_button: string = null; //(tbl)Pick + Subscribe";
    public article_pick_button: string = null; //(tbl)This answers my question";
    public suggestion_subscribe_button: string = null; //(tbl)I want this";
    public suggestion_subscribe_title: string = null; //(tbl)Great stuff!";
    public suggestion_subscribe_body: string = null; //(tbl)Do you want updates about this idea?";
    public suggestion_subscribed_body: string = null; //(tbl)We’ll update you as this idea progresses";
    public contact_confirm_title: string = null; //(tbl)Awesome!!!";
    public contact_confirm_body: string = null; //(tbl)Do you still want to send us a message?";
    public post_suggestion_confirm_title: string = null; //(tbl)Okay.";
    public post_suggestion_confirm_body: string = null; //(tbl)Do you still want to submit an idea?";
    public post_suggestion_success_title: string = null; //(tbl)Thank you!";
    public post_suggestion_success_body: string = null; //(tbl)Your feedback has been posted to our %{link:feedback forum}";
    public contact_success_title: string = null; //(tbl)Message sent!";
    public contact_success_body: string = null; //(tbl)We'll be in touch.";
    public satisfaction_success_title: string = null; //(tbl)Thank you!";
    public satisfaction_success_body: string = null; //(tbl)We take your feedback to heart.";
    public instant_answers_success_title: string = null; //(tbl)Thank you!";
    public instant_answers_success_body: string = null; //(tbl)We take your feedback to heart.";
    public post_suggestion_body: string = null; //(tbl)When you post an idea to our feedback forum others will be able to subscribe to it and make comments."

    public strings(): { [index: string]: string } {
        var results: { [index: string]: string } = {};

        const properties: Array<string> = [
            "contact_menu_label",
            "smartvote_menu_label",
            "post_suggestion_menu_label",
            "contact_title",
            "smartvote_title",
            "satisfaction_message_title",
            "post_suggestion_title",
            "instant_answers_title",
            "contact_details_title",
            "post_suggestion_details_title",
            "smartvote_success_title",
            "contact_message_placeholder",
            "satisfaction_message_placeholder",
            "post_suggestion_message_placeholder",
            "suggestion_title_placeholder",
            "email_address_placeholder",
            "instant_answers_related_suggestions_label",
            "instant_answers_related_articles_label",
            "suggestion_title_label",
            "suggestion_category_label",
            "email_address_label",
            "contact_skip_instant_answers_button",
            "post_suggestion_skip_instant_answers_button",
            "contact_submit_button",
            "post_suggestion_submit_button",
            "smartvote_pick_button",
            "smartvote_subscribe_button",
            "article_pick_button",
            "suggestion_subscribe_button",
            "suggestion_subscribe_title",
            "suggestion_subscribe_body",
            "suggestion_subscribed_body",
            "contact_confirm_title",
            "contact_confirm_body",
            "post_suggestion_confirm_title",
            "post_suggestion_confirm_body",
            "post_suggestion_success_title",
            "post_suggestion_success_body",
            "contact_success_title",
            "contact_success_body",
            "satisfaction_success_title",
            "satisfaction_success_body",
            "instant_answers_success_title",
            "instant_answers_success_body",
            "post_suggestion_body"
        ];

        properties.forEach((prop: string) => {
            if (!StringHelper.isNullOrEmpty(this[prop])) {
                results[prop] = this[prop];
            }
        });

        return results;
    }
}

export default UserVoiceStringsOverride;
