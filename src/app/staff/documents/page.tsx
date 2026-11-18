"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function StaffDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Customer Documents & Verification Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor verification progress for KYC and income documents submitted for your leads.
        </p>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Admin Remarks</th>
                <th className="py-3 px-4 text-right">View Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No documents uploaded yet. Open an assigned lead to upload documents.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {doc.lead?.name}
                      <div className="text-[11px] font-mono text-slate-400 font-normal">
                        {doc.lead?.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(doc.uploadedAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          doc.status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : doc.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {doc.status === "VERIFIED" && <CheckCircle className="w-3 h-3" />}
                        {doc.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                        {doc.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {doc.remarks || "-"}
                      {doc.verifiedBy && (
                        <span className="text-[10px] text-slate-400 block">by {doc.verifiedBy}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/staff/leads/${doc.leadId}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Open Lead
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
