import Image from "next/image";

type Faq = {
  question: string;
  answer: React.ReactNode;
};

const FAQS: Faq[] = [
  {
    question: "What time should I arrive?",
    answer: (
      <>
        <p>Please arrive by 4pm* so we can start on time.</p>
        <p className="text-sm italic mt-2 text-on-surface-variant/80">
          *not 4 pm Greek/Malaysian time pls
        </p>
      </>
    ),
  },
  {
    question: "Where is the ceremony/reception?",
    answer: (
      <p>
        The ceremony is outdoors and will be held at Ceres, an urban farm in
        Brunswick. Our reception will be indoors at Maharaja Palace in
        Northcote. Don&apos;t stress if it rains, there will be wet weather
        cover. Please check out our venue info for parking details.
      </p>
    ),
  },
  {
    question: "What's the best way to get there?",
    answer: (
      <div className="space-y-3">
        <p>
          Parking is limited, so we recommend catching public transport or
          Ubers.
        </p>
        <p>
          <span className="font-headline font-bold text-on-surface">
            To get to Ceres:
          </span>{" "}
          Take the Number 96 tram to East Brunswick from the city (from Bourke
          St, travelling up Nicholson St) to Blyth Street, which is the last
          stop. CERES is about a 2 minute walk east from the tram stop.
        </p>
        <p>
          <span className="font-headline font-bold text-on-surface">
            To get from Ceres to Maharaja Palace:
          </span>{" "}
          It&apos;s a 6 minute drive, 26 minute walk or 13 minute bus ride (508
          to Alphington).
        </p>
        <p>
          <span className="font-headline font-bold text-on-surface">
            To get home:
          </span>{" "}
          Maharaja is right next to Northcote train station or the 86 tram.
        </p>
      </div>
    ),
  },
  {
    question: "Is there parking available?",
    answer: (
      <p>
        The venue locations are inner Melbourne and parking is limited,
        especially at the reception. We recommend that you travel to the venue
        via public transport or Uber. For parking info, see the venue map.
      </p>
    ),
  },
  {
    question: "Do you have a gift registry?",
    answer: (
      <p>
        Your presence at our wedding means a lot to us, and we don&apos;t
        expect any gifts. More than half of you are travelling from
        interstate/overseas and we really appreciate the effort and cost
        involved to make this happen. If you do want to contribute something,
        you can transfer to{" "}
        <span className="font-headline font-bold text-on-surface">
          PAY ID: 0490923671
        </span>
        , but don&apos;t feel like you need to.
      </p>
    ),
  },
  {
    question: "What's the dress code?",
    answer: (
      <p>
        Cocktail. Bright colours and loud prints are encouraged. Check out our{" "}
        <a
          href="#moodboard"
          className="text-primary underline decoration-primary/40 hover:decoration-primary"
        >
          mood board
        </a>{" "}
        for more info.
      </p>
    ),
  },
  {
    question: "Will the wedding be indoors or outdoors?",
    answer: (
      <p>
        The ceremony will be outdoors, and the reception will be indoors. Late
        summer in Melbourne can vary weatherwise but let&apos;s collectively
        manifest a sunny, cloudless day (between 20-26 degrees).
      </p>
    ),
  },
  {
    question: "Can I bring a plus one?",
    answer: (
      <p>
        If Hannah could, she would invite the whole world. But venue capacity
        is limited, so invites are for named guests only.
      </p>
    ),
  },
  {
    question: "Can you accommodate dietary requirements?",
    answer: <p>Yes — let us know when you RSVP.</p>,
  },
  {
    question: "Will there be food and drinks?",
    answer: (
      <p>
        Dinner will be shared style Northern Indian, and we are providing
        plenty of alcohol/non-alcoholic options. Entrées are served at 6:30pm
        and we&apos;re going to feed you until you can&apos;t take it anymore.
        Wear something you can unbutton.
      </p>
    ),
  },
  {
    question: "I am travelling from interstate/overseas, where should I stay?",
    answer: (
      <p>
        Preston, Fairfield, Northcote, Brunswick, Fitzroy, Collingwood are all
        great options. If you need help organising accommodation, contact
        Ismene who can give you tips and also help you buddy up with a group
        if you&apos;re coming alone.
      </p>
    ),
  },
  {
    question: "Are the wedding venue(s) wheelchair accessible?",
    answer: (
      <div className="space-y-3">
        <p>
          No, they are not. The ceremony at Ceres is in an urban farm which
          has gravel roads and is a 5 min walk from the street to the ceremony
          location. If you have access requirements, you can be driven
          directly to the ceremony, please let us know and we can talk you
          through it. At the reception, there are two flights of stairs and no
          lift.
        </p>
        <p>
          Although this wedding is not wheelchair accessible, we will do our
          best to make it accessible to the non-English speakers in
          attendance, especially our French guests. On vous soutient!
        </p>
      </div>
    ),
  },
  {
    question: "Are pictures allowed during the wedding ceremony?",
    answer: (
      <p>
        We are having a professional photographer, so no photos necessary. If
        you can bear it, keep your camera/iPad in your pocket until the
        reception.
      </p>
    ),
  },
  {
    question: "Are kids invited?",
    answer: (
      <p>
        Yes! If you have kid/s, their names will be included on your invite.
      </p>
    ),
  },
  {
    question: "Will there be dancing?",
    answer: (
      <p>
        The ceremony, the speeches and the meals are all a lead up to the
        dancefloor. We hope that you can join us at the afterparty too, where
        the dancing will continue until late.
      </p>
    ),
  },
  {
    question: "But you're both so short and look like children.",
    answer: (
      <p>
        We swear, we&apos;re not! For those that keep asking if we&apos;re
        related, no comment.
      </p>
    ),
  },
];

export default function Faqs() {
  return (
    <section
      id="faqs"
      className="py-24 px-6 max-w-4xl mx-auto relative scroll-mt-24"
    >
      <div className="absolute -top-8 -left-6 md:-left-10 opacity-50 pointer-events-none rotate-[-12deg]">
        <Image
          src="/assets/star.svg"
          alt=""
          width={120}
          height={120}
          className="w-16 md:w-24 h-auto"
        />
      </div>

      <div className="text-center mb-10 md:mb-12">
        <h2 className="font-display text-5xl md:text-6xl font-bold text-primary handwritten-tilt inline-block">
          FAQs
        </h2>
        <p className="mt-3 text-on-surface-variant text-base md:text-lg max-w-xl mx-auto">
          Everything you might be wondering about, from dress code to dancing.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map(({ question, answer }) => (
          <details
            key={question}
            className="group bg-surface-container-lowest scrapbook-shadow rounded-2xl border border-primary-container/20 overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 list-none px-5 md:px-6 py-4 hover:bg-primary-container/10 transition-colors">
              <span className="font-headline font-extrabold text-base md:text-lg text-on-surface">
                {question}
              </span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-primary text-2xl leading-none transition-transform group-open:rotate-180 select-none"
              >
                expand_more
              </span>
            </summary>
            <div className="px-5 md:px-6 pb-5 pt-1 text-on-surface-variant leading-relaxed text-base md:text-lg space-y-3">
              {answer}
            </div>
          </details>
        ))}
      </div>

      <p className="mt-10 text-center text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
        If your question hasn&apos;t been answered, contact us! If you want to
        talk about dogs, contact Hannah! If you&apos;ve got a secret you want
        to get off your chest, contact Ismene!
      </p>
    </section>
  );
}
