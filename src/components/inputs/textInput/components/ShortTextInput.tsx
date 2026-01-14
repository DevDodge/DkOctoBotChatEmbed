import { createSignal, splitProps, createEffect, onCleanup } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

type ShortTextInputProps = {
  ref: HTMLInputElement | HTMLTextAreaElement | undefined;
  onInput: (value: string) => void;
  fontSize?: number;
  disabled?: boolean;
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>;

const DEFAULT_HEIGHT = 56;

const ARABIC_PLACEHOLDERS = [
  'أنا مش بس بوت بيرد، أنا بياع شاطر بيقفل لك الديل',
  'ابعت فويس أو صورة.. أنا بفهم كل حاجة وبكل اللهجات',
  'ريح بالك وسيب الإدارة عليا.. شغال معاك 24 ساعة مابتعبش',
  'أنا هسمع عميلك للآخر وأرد عليه رد واحد يخلص الكلام',
  'معايا مفيش أوردر هيضيع، هجمع البيانات وأكد الحجز في لحظة',
  'متشيلش هم التحويلات المضروبة، أنا بكشف الصور وبقولك الحقيقة',
  'هعرفك عميلك بيحب إيه وهبعت له عرض مخصوص يخليه يشتري',
  'أنا المساعد الذكي اللي هينظم مواعيدك ويربط لك الدنيا ببعضها',
  'أوكتوبوت بيفهم عميلك عايز إيه من غير ما يزهقه في الأسئلة',
  'عايز تزود مبيعاتك وتنسى المرتجعات؟ سيب المهمة دي عليا',
  'بتابع الأوردرات لحظة بلحظة وبقول للعميل مكان المندوب فين',
  'لو عندك زحمة كومنتات، أنا هرد عليهم وأسحبهم عالشات كمان',
  'بربط لك البيزنس بـ Google Sheets و Odoo وأي سيستم شغال بيه',
  'أنا البوت اللي بيعرف يبيع ويقنع المترددين بعروض مخصصة',
  'تحليل كامل لكل عميل عشان تعرف مين المهتم ومين اللي بيشتري',
  'تنساش الأقساط.. أنا هفكر عملائك بمواعيد الدفع أوتوماتيك',
  'أوكتوبوت هو الموظف اللي مبينايمش، بيرد في ثانية وبدقة عالية',
  'أنا بكشف إيصالات التحويل الفيك وبقفل لك الديل وأنا مطمن',
  'مساعدك الذكي في المبيعات، خدمة العملاء، والدعم الفني كمان',
  'سيب لي تجميع البيانات (الاسم، العنوان، التليفون) وركز أنت في تطوير شغلك'
];

export const ShortTextInput = (props: ShortTextInputProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput']);
  const [height, setHeight] = createSignal(56);
  const [placeholderIndex, setPlaceholderIndex] = createSignal(0);
  const [displayedText, setDisplayedText] = createSignal('');
  const [isFocused, setIsFocused] = createSignal(false);

  let typingInterval: ReturnType<typeof setInterval> | undefined;
  let messageInterval: ReturnType<typeof setInterval> | undefined;

  // Typing effect
  const typeText = (text: string) => {
    let charIndex = 0;
    setDisplayedText('');

    if (typingInterval) clearInterval(typingInterval);

    typingInterval = setInterval(() => {
      if (charIndex <= text.length) {
        setDisplayedText(text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); // 50ms per character for typing speed
  };

  // Start typing effect for current placeholder
  createEffect(() => {
    const currentText = ARABIC_PLACEHOLDERS[placeholderIndex()];
    typeText(currentText);
  });

  // Rotate to next placeholder every 4 seconds
  messageInterval = setInterval(() => {
    setPlaceholderIndex((prev) => (prev + 1) % ARABIC_PLACEHOLDERS.length);
  }, 4000);

  onCleanup(() => {
    if (typingInterval) clearInterval(typingInterval);
    if (messageInterval) clearInterval(messageInterval);
  });

  // @ts-expect-error: unknown type
  const handleInput = (e) => {
    if (props.ref) {
      if (e.currentTarget.value === '') {
        setHeight(DEFAULT_HEIGHT);
      } else {
        setHeight(e.currentTarget.scrollHeight - 24);
      }
      e.currentTarget.scrollTo(0, e.currentTarget.scrollHeight);
      local.onInput(e.currentTarget.value);
    }
  };

  // @ts-expect-error: unknown type
  const handleKeyDown = (e) => {
    if (e.keyCode == 13 && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.value += '\n';
      handleInput(e);
    }
  };

  const showPlaceholder = () => !props.value && !isFocused();

  return (
    <div class="relative flex-1 w-full h-full min-h-[56px] max-h-[128px]">
      {/* Typing placeholder overlay - fixed position within container */}
      {showPlaceholder() && (
        <div
          class="absolute inset-0 flex items-center px-4 pointer-events-none z-10"
          style={{
            color: '#9013FE',
            'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
            direction: 'rtl',
            'text-align': 'right',
            'font-weight': '500',
          }}
        >
          {displayedText()}
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.2em',
              'background-color': '#9013FE',
              'margin-right': '2px',
              animation: 'blink 1s step-end infinite',
            }}
          />
        </div>
      )}
      <textarea
        ref={props.ref}
        class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full h-full min-h-[56px] max-h-[128px] text-input disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100"
        disabled={props.disabled}
        style={{
          'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
          resize: 'none',
          height: `${props.value !== '' ? height() : DEFAULT_HEIGHT}px`,
          'caret-color': showPlaceholder() ? 'transparent' : '#9013FE',
          direction: 'rtl',
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=""
        {...others}
      />
    </div>
  );
};


