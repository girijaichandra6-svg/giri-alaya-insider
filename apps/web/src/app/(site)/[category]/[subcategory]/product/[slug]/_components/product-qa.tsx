"use client";

import * as React from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface QAItem {
  id: string;
  question: string;
  answer: string | null;
  user: { name: string | null };
}

interface ProductQAProps {
  productId: string;
}

export function ProductQA({ productId: _productId }: ProductQAProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [questions] = React.useState<QAItem[]>([]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-1">
            Questions & Answers
          </h2>
          <p className="text-sm text-muted font-body">
            {questions.length} questions
          </p>
        </div>
        <SignedIn>
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ask a Question
          </Button>
        </SignedIn>
      </div>

      <SignedOut>
        <div className="text-center py-8">
          <p className="text-sm text-muted mb-3 font-body">
            Sign in to ask a question
          </p>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      {showForm && (
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-graphite">
          <Input
            placeholder="Type your question..."
            className="mb-3"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button size="sm">Submit Question</Button>
          </div>
        </div>
      )}

      {questions.length === 0 && !showForm && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-body">
            No questions yet. Ask the community!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((qa) => (
          <div
            key={qa.id}
            className="p-4 rounded-xl border border-white/5 bg-graphite/30"
          >
            <p className="text-sm font-medium text-softWhite font-ui mb-2">
              Q: {qa.question}
            </p>
            {qa.answer ? (
              <p className="text-sm text-softWhite/70 font-body">
                A: {qa.answer}
              </p>
            ) : (
              <p className="text-xs text-muted italic font-body">
                Awaiting answer
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
