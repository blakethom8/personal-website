---
title: Healthcare Data & Analysis
category: healthcare-data
---

## The Quick Download

Medicare claims data is one of the richest public datasets that almost nobody actually uses well. CMS releases hundreds of millions of records every year — provider billing, utilization patterns, geographic variation, fraud indicators — and most of it sits underexplored. That's the opportunity I'm working through.

## Why Healthcare Data

I came to this through OpenClaw. The original question was: can an agent navigate complex healthcare data the same way a senior analyst would? The more I dug in, the more I realized the data itself is the interesting part. The patterns are rich, the quality problems are real, and the stakes are high enough that accuracy actually matters.

## What I'm Working With

The main datasets: Medicare Part A/B/D claims, the NPI registry, CMS utilization and payment data, and the Physician and Other Supplier PUF files. These are all public, but cleaning and joining them is nontrivial. A lot of the early work has been entity resolution — figuring out that two provider records are the same person across different datasets.

## The Research Direction

Right now I'm focused on provider network analysis and utilization patterns. Longer term, I want to build toward anomaly detection — not fraud detection in a legal sense, but identifying statistical outliers that warrant a closer look. The data supports it; it's mostly an infrastructure and methodology problem.

## Early Days

This section is more sparse than the others because the research is still early. I'll be writing more here as the OpenClaw data work matures. The datasets are rich — I just need more time with them.
