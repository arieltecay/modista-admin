export interface CouponFormProps {
  courses: Array<{ id: string; title: string; price: number }>;
  /** True while the request runs: the submit button is off so nothing is sent twice. */
  submitting: boolean;
  onSubmit: (payload: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    startsAt: string;
    endsAt: string;
    courseId: string | null;
    maxUses: number | null;
  }) => void;
  onCancel: () => void;
  /** Message of the last failed attempt (e.g. a repeated code). */
  serverError?: string;
}
