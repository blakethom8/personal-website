import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { Panel } from "@/components/Panel";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Blake Thomson.",
};

export default function ContactPage() {
  return (
    <>
      <PageBackground src={backgrounds.contact} alt="Calm sunset over the Pacific" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        <Panel>
          <p className="label-mono mb-2">contact</p>
          <h1 className="font-serif text-2xl md:text-3xl">
            Let&apos;s talk.
          </h1>
          <p className="mt-3 max-w-xl text-fg-muted">
            Whether it&apos;s a business inquiry, a collaboration idea, or just a
            question about something I wrote — I&apos;d love to hear from you.
          </p>
        </Panel>

        <div className="mx-auto flex w-[calc(100%-2*16px)] max-w-[1200px] flex-col gap-4 md:w-[calc(100%-2*40px)] md:flex-row">
          {/* Form */}
          <Panel className="flex-1" as="section">
            <form className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField label="name" name="name" type="text" required />
                <InputField label="email" name="email" type="email" required />
              </div>
              <div>
                <label className="label-mono mb-1.5 block">
                  subject
                </label>
                <select
                  name="subject"
                  className="w-full rounded border border-border bg-bg-panel px-3 py-2 font-mono text-[13px] text-fg outline-none transition-colors focus:border-accent"
                >
                  <option>General</option>
                  <option>Business Inquiry</option>
                  <option>Collaboration</option>
                  <option>Speaking</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label-mono mb-1.5 block">
                  message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className="w-full resize-y rounded border border-border bg-bg-panel px-3 py-2 text-[13px] text-fg outline-none transition-colors focus:border-accent"
                  placeholder="What's on your mind?"
                />
              </div>
              <button
                type="submit"
                className="self-start rounded border border-accent bg-accent px-5 py-2 font-mono text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
              >
                send message
              </button>
            </form>
          </Panel>

          {/* Sidebar links */}
          <aside className="panel w-full self-start px-5 py-5 md:w-[240px]">
            <p className="label-mono mb-3">other ways to reach me</p>
            <div className="flex flex-col gap-3">
              <ContactLink
                label="email"
                value="blakethomson8@gmail.com"
                href="mailto:blakethomson8@gmail.com"
              />
              <ContactLink
                label="github"
                value="blakethom8"
                href="https://github.com/blakethom8"
              />
              <ContactLink
                label="linkedin"
                value="Blake Thomson"
                href="https://linkedin.com/in/blakethomson"
              />
              <div className="border-t border-border-light pt-3">
                <p className="font-mono text-[11px] text-fg-light">
                  based in santa monica, ca
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function InputField({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label-mono mb-1.5 block">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded border border-border bg-bg-panel px-3 py-2 text-[13px] text-fg outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}

function ContactLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] text-fg-light">{label}</p>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-[13px] text-accent hover:text-accent-hover"
      >
        {value}
      </a>
    </div>
  );
}
