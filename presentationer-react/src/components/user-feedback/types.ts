export interface UserFeedbackItem {
    quote: string;
    author: string;
}

export interface UserFeedbackContent {
    items: UserFeedbackItem[];
    fontSizeMultiplier?: number;
}
