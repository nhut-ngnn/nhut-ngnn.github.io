---
layout: page
permalink: /publications/
title: Publications
description: Peer-reviewed journal articles, conference papers, and preprints, in reverse chronological order.
nav: true
nav_order: 2
---

{% include coauthor_graph.liquid %}

<!-- prettier-ignore-start -->
<div class="ac-legend">
  <span class="ac-legend-item"><span class="ac-swatch" style="background-color:#600"></span>Journal</span>
  <span class="ac-legend-item"><span class="ac-swatch" style="background-color:#215d42"></span>Conference</span>
  <span class="ac-legend-item"><span class="ac-swatch" style="background-color:#0d93bf"></span>Preprint</span>
  <span class="ac-legend-item">&dagger;&nbsp; equal contribution</span>
  <span class="ac-legend-item">*&nbsp; corresponding author</span>
</div>
<!-- prettier-ignore-end -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>
