"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { OfferLetter } from "@/types/offer";
import { Candidate } from "@/types/candidate";
import { db } from "@/lib/storage/db";
import { CandidateOfferPortal } from "@/components/offers/CandidateOfferPortal";

export default function CandidateOfferPublicPage() {
  const params = useParams();
  const id = params.id as string;

  const [offer, setOffer] = useState<OfferLetter | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If demo or lookup by offer ID / offer number
    let foundOffer = db.getOfferLetterById(id);
    if (!foundOffer && id === "demo") {
      foundOffer = db.getOfferLetters()[0];
    } else if (!foundOffer) {
      // Look up by candidate id as fallback
      foundOffer = db.getOfferLetters().find((o) => o.candidate_id === id) || db.getOfferLetters()[0];
    }

    if (foundOffer) {
      setOffer(foundOffer);
      const foundCandidate = db.getCandidateById(foundOffer.candidate_id);
      setCandidate(foundCandidate || null);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Loading official offer package...
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-xl font-bold">Offer Not Found</h2>
          <p className="text-xs text-slate-400">
            This offer link may have expired or been removed. Please contact the talent acquisition team.
          </p>
        </div>
      </div>
    );
  }

  return <CandidateOfferPortal initialOffer={offer} initialCandidate={candidate || undefined} />;
}
