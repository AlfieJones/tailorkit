import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";

// ─── Brand logos ──────────────────────────────────────────────────────────────

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function StripeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
  );
}

function SlackLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}

function LinearLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L38.4762 96.9518c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.2049 5.37949 79.5493 1.22541 61.5228zM.00189135 46.8891c-.01764375 1.0807.95414 1.9095 2.01543 1.7648L52.4526 41.0794c1.0613-.1447 1.5791-1.4134.9338-2.2924L32.5061 11.2276c-.6453-.879-1.9794-.7209-2.4392.2815C23.5896 25.0933 .440333 33.9608.00189135 46.8891zM14.5249 6.22234c-.4518-.60193-.1884-1.46848.51206-1.72954C22.7097 1.52678 31.5797 0 40.8437 0c29.579 0 54.1074 20.3344 61.3752 47.7664.1935.7488-.4908 1.4138-1.2547 1.2143L14.5249 6.22234zM16.7855 77.5268c-.6958.6958-.6074 1.8659.1945 2.4527C26.7579 87.0168 38.8297 91 51.7862 91c32.7571 0 59.2631-26.5 59.2631-59.2571 0-13.6664-4.5027-26.2711-12.0802-36.3771-.5619-.7529-1.6894-.7963-2.3509-.0947L16.7855 77.5268z" />
    </svg>
  );
}

function NotionLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}

function AnthropicLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.3041 3.541h-3.5795l-5.9723 16.918h3.5l1.3609-3.8578h5.7236l1.3609 3.8578h3.5L17.3041 3.541zm-3.7236 9.9768 1.9345-5.4856 1.9345 5.4856h-3.869zM6.6959 3.541H3.1164L-.757 20.459h3.5l1.3609-3.8578h5.7236l.9162 2.5993-2.5396 1.2586H6.6959V3.541z" />
    </svg>
  );
}

function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

// ─── Logo pill ─────────────────────────────────────────────────────────────────

function LogoPill({
  logo: Logo,
  bg,
  color,
  label,
}: {
  logo: (props: { className?: string }) => React.JSX.Element;
  bg: string;
  color: string;
  label: string;
}) {
  return (
    <div
      title={label}
      className={clsx(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 shadow-sm",
        bg,
      )}
    >
      <Logo className={clsx("h-4 w-4", color)} />
    </div>
  );
}

// ─── Cards data ────────────────────────────────────────────────────────────────

const CARDS = [
  {
    title: "Build Features",
    description:
      "Partners and users can ship focused, installed extensions that live natively inside your product.",
    logos: [
      { logo: StripeLogo, bg: "bg-[#635BFF]", color: "text-white", label: "Stripe" },
      { logo: SlackLogo, bg: "bg-[#4A154B]", color: "text-white", label: "Slack" },
      { logo: GitHubLogo, bg: "bg-[#24292e]", color: "text-white", label: "GitHub" },
    ],
  },
  {
    title: "Add Pages",
    description: "Hosted pages extend your product surface without cutting a new app release.",
    logos: [
      { logo: VercelLogo, bg: "bg-[#000000]", color: "text-white", label: "Vercel" },
      { logo: NotionLogo, bg: "bg-[#191919]", color: "text-white", label: "Notion" },
      { logo: LinearLogo, bg: "bg-[#5E6AD2]", color: "text-white", label: "Linear" },
    ],
  },
  {
    title: "AI Builder",
    description:
      "Agents generate and refine full app experiences from your existing design system and APIs.",
    logos: [
      { logo: AnthropicLogo, bg: "bg-[#D4A27F]", color: "text-[#1a0a00]", label: "Anthropic" },
      { logo: OpenAILogo, bg: "bg-[#10a37f]", color: "text-white", label: "OpenAI" },
    ],
  },
  {
    title: "Marketplace",
    description:
      "One familiar place where users discover, install, and manage every extension for your platform.",
    logos: [
      { logo: GitHubLogo, bg: "bg-[#24292e]", color: "text-white", label: "GitHub" },
      { logo: StripeLogo, bg: "bg-[#635BFF]", color: "text-white", label: "Stripe" },
      { logo: SlackLogo, bg: "bg-[#4A154B]", color: "text-white", label: "Slack" },
      { logo: VercelLogo, bg: "bg-[#000000]", color: "text-white", label: "Vercel" },
    ],
  },
];

// ─── Feature cards ─────────────────────────────────────────────────────────────

export function FeatureCards() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="group flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 transition-colors hover:bg-muted/30"
          >
            <div className="flex gap-2">
              {card.logos.map((item) => (
                <LogoPill key={item.label} {...item} />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
            </div>
            <div className="mt-auto flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Learn more
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
      >
        View more
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
