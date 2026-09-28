import jsPDF from "jspdf";
import { OfferLetter } from "@/types/offer";
import { Candidate } from "@/types/candidate";
import { Organization } from "@/types/auth";
import { formatDate } from "../utils";

export interface OfferPdfOptions {
  offer: OfferLetter;
  candidate?: Candidate;
  organization?: Partial<Organization>;
}

export function generateOfferLetterPdf({ offer, candidate, organization }: OfferPdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const orgName = organization?.name || "HIREFLOW TECHNOLOGIES INC.";
  const orgAddress = organization?.address || "100 Innovation Way, Suite 400, San Francisco, CA 94105";
  const orgEmail = organization?.email || "talent@hireflow.io";

  // Header Banner
  doc.setFillColor(15, 23, 42); // Navy #0F172A
  doc.rect(margin, y, contentWidth, 24, "F");

  // Header Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(orgName, margin + 6, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(190, 205, 225);
  doc.text(`${orgAddress}  |  ${orgEmail}`, margin + 6, y + 18);

  y += 34;

  // Metadata block: Date & Offer Ref
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${formatDate(offer.created_at || new Date().toISOString())}`, margin, y);
  doc.text(`Offer Ref: ${offer.offer_number}`, pageWidth - margin, y, { align: "right" });

  y += 10;

  // Candidate Address Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRIVATE & CONFIDENTIAL", margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(offer.candidate_name || candidate?.full_name || "Valued Applicant", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  if (candidate?.email) {
    doc.text(candidate.email, margin, y);
    y += 5;
  }
  if (candidate?.address) {
    doc.text(candidate.address, margin, y);
    y += 5;
  }

  y += 6;

  // Subject line
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Subject: Official Offer of Employment - ${offer.job_title}`, margin, y);
  y += 8;

  // Salutation
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Dear ${offer.candidate_name || candidate?.full_name || "Candidate"},`, margin, y);
  y += 6;

  // Opening Paragraph
  const introText =
    `We are delighted to extend this formal offer of employment for the position of ` +
    `${offer.job_title} within the ${offer.department} department at ${orgName}. ` +
    `We were very impressed with your background, technical expertise, and vision, and we firmly believe you will make significant contributions to our organization.`;

  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, margin, y);
  y += splitIntro.length * 5 + 4;

  // Employment Terms Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const termsBoxHeight = 56;
  doc.roundedRect(margin, y, contentWidth, termsBoxHeight, 2, 2, "FD");

  const col1 = margin + 5;
  const col2 = margin + 90;
  let boxY = y + 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  // Row 1
  doc.text("Position:", col1, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(offer.job_title, col1 + 32, boxY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Department:", col2, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(offer.department, col2 + 32, boxY);
  boxY += 8;

  // Row 2
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Compensation:", col1, boxY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Brand blue
  doc.text(offer.salary, col1 + 32, boxY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Employment Type:", col2, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(offer.employment_type || "Full-time", col2 + 32, boxY);
  boxY += 8;

  // Row 3
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Start Date:", col1, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(formatDate(offer.joining_date), col1 + 32, boxY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Work Location:", col2, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(offer.work_location || "Remote", col2 + 32, boxY);
  boxY += 8;

  // Row 4
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Reporting To:", col1, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(offer.reporting_manager || "Engineering Director", col1 + 32, boxY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Offer Expiry:", col2, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 38, 38); // Red
  doc.text(formatDate(offer.expiry_date), col2 + 32, boxY);
  boxY += 8;

  // Row 5
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Benefits & Perks:", col1, boxY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(offer.benefits || "Comprehensive Health Insurance, 401(k) match, Unlimited PTO, Learning Stipend", col1 + 32, boxY);

  y += termsBoxHeight + 8;

  // Terms & Conditions note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const termsText =
    `This offer is contingent upon successful verification of professional credentials and background checks. ` +
    `Please indicate your acceptance by signing electronically below or submitting your confirmation through the candidate portal prior to ${formatDate(offer.expiry_date)}.`;
  const splitTerms = doc.splitTextToSize(termsText, contentWidth);
  doc.text(splitTerms, margin, y);
  y += splitTerms.length * 4.5 + 8;

  // Signature Blocks (2 columns: Authorized Signatory vs Candidate Acceptance)
  const sigColWidth = contentWidth / 2 - 5;

  // Signatory (Company)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("For " + orgName + ":", margin, y);

  // Candidate
  doc.text("Candidate Acceptance:", margin + sigColWidth + 10, y);
  y += 14;

  // Simulated Signature Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + sigColWidth, y);
  doc.line(margin + sigColWidth + 10, y, margin + contentWidth, y);
  y += 5;

  // Company signatory name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(offer.signatory_name || "Sarah Jenkins", margin, y);
  
  // Candidate acceptance signature
  if (offer.status === "Accepted") {
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`Digitally Signed: ${offer.candidate_signature_name || offer.candidate_name}`, margin + sigColWidth + 10, y);
  } else {
    doc.setTextColor(148, 163, 184);
    doc.text("Signature / Date", margin + sigColWidth + 10, y);
  }
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(offer.signatory_designation || "VP of People & Operations", margin, y);

  if (offer.status === "Accepted" && offer.responded_at) {
    doc.setTextColor(22, 163, 74);
    doc.text(`Accepted on ${formatDate(offer.responded_at)}`, margin + sigColWidth + 10, y);
  }

  // Footer on bottom of page
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `HireFlow Offer Management Platform  |  Offer Document #${offer.offer_number}  |  Page 1 of 1`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
}

export function downloadOfferPdf(options: OfferPdfOptions) {
  const doc = generateOfferLetterPdf(options);
  const fileName = `Offer_Letter_${options.offer.offer_number}_${(options.offer.candidate_name || "Candidate").replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

export function getOfferPdfBlobUrl(options: OfferPdfOptions): string {
  const doc = generateOfferLetterPdf(options);
  return doc.output("bloburl").toString();
}
