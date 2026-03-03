"use client";
/* eslint-disable react/no-unescaped-entities */

export function Module0Content() {
  return (
    <div className="post-content">
      <h2 className="mb-4 font-serif text-2xl">Why This Guide Exists</h2>
      
      <p className="mb-4 italic text-fg-muted">
        A practical guide for understanding agents and peeking under the hood.
      </p>

      <p className="mb-6">
        By the end of this guide, I hope you'll understand how to think about
        agents — whether you're interacting with them in your browser with
        ChatGPT or using a tool like Claude Code. The best outcome would be for
        you to understand how these systems function so you can ask the right
        questions to learn about any agent you're interacting with.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">
        Who This Is For and a Note on Learning
      </h2>

      <p className="mb-4">
        This guide is for anyone who wants to understand what an AI agent
        actually is and how it works. While there is technical content, my goal
        is for the concepts to be accessible by everybody.
      </p>

      <p className="mb-6">
        If there's anything to take away from this article, it's that you can use
        these LLM agents to learn anything you want. I highly recommend that while
        you're going through these writings, if there are topics you're curious
        about — or topics I don't explain well enough — you copy and paste that
        text and share it with any of your browser agents. I've found, through
        developing agentic applications, that these tools are the best teachers.
        You can ask them any question, and they will help — as long as you know
        how to ask it the right way.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">What This Guide IS About</h2>

      <p className="mb-4">
        This guide is how I think about LLMs from an application perspective. The
        key concepts you should be able to more deeply understand are:
      </p>

      <ul className="mb-6 list-disc space-y-2 pl-6">
        <li>
          <strong>The difference between the LLM model and an agent</strong>
        </li>
        <li>
          <strong>The structure of an API call</strong> and what's included in
          the request-response cycle
        </li>
        <li>
          <strong>System context, user messages, and context management</strong>
        </li>
        <li>
          <strong>Tools</strong> — what they do, how an agent decides to use them
        </li>
        <li>
          <strong>Multi-turn interactions</strong> — ReACT patterns
        </li>
        <li>
          <strong>How the full agentic harness</strong> gives an agent its
          capability and character
        </li>
      </ul>

      <h2 className="mb-4 font-serif text-2xl">What This Guide IS NOT About</h2>

      <p className="mb-4">
        We will not do a deep dive into LLM models themselves. The concepts around
        transformers, neural networks, etc. are out of scope. To be frank, I do
        not believe you need to understand those details to apply agents today.
      </p>

      <p className="mb-6">
        From an application standpoint, you should be able to understand the
        differences between models like Claude Opus versus Haiku or Sonnet,
        understand the context window, and learn a little more about how they
        operate — but the internals of model training are not something we'll
        cover here.
      </p>

      <hr className="my-6 border-border-light" />

      <h2 className="mb-4 font-serif text-2xl">What We Will Cover</h2>

      <p className="mb-4">
        <strong>1. The Big Picture</strong> — What an AI agent actually is: the
        engine vs. the car
      </p>
      <p className="mb-4">
        <strong>2. How AI Communicates</strong> — The structured messages that
        flow between you and the model
      </p>
      <p className="mb-4">
        <strong>3. Context & Memory</strong> — Why AI "forgets" everything
        between messages, and how we solve that
      </p>
      <p className="mb-4">
        <strong>4. Tools & Actions</strong> — How agents interact with the real
        world
      </p>
      <p className="mb-4">
        <strong>5. Agentic Patterns</strong> — The difference between a chatbot
        and a true agent
      </p>
      <p className="mb-6">
        <strong>Epilogue</strong> — Why Claude Code, Claude Desktop, and ChatGPT
        behave so differently
      </p>

      <hr className="my-8 border-border-light" />

      <p className="text-center font-semibold text-fg">
        Let's start with the big picture.
      </p>
    </div>
  );
}
