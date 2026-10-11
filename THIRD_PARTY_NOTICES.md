# Third-party notices

## Keybr

The Learning V1 continuous-practice implementation includes source and data
from [keybr.com](https://github.com/aradzie/keybr.com) revision
`05a37bc5265f65ff538c59c613db29442f345d51`.

Keybr is licensed under the GNU Affero General Public License, version 3. The
license text and imported source snapshot are available in `vendor/keybr/`.
Integrity and provenance details are recorded in `vendor/keybr/README.md`.

The deployed service must offer the corresponding source and required build
materials for the version actually running. This repository document records
that obligation; it does not claim that a public deployment or source release
has already happened.

## KTouch

Learning V1 uses the behavior of KTouch revision
`a3f57d03e6c14956378af1176eef3404430c773e` as the fixed-course baseline.
The original `data/courses/gb.xml` is preserved under `vendor/ktouch/`; the
runtime conversion keeps all lessons unchanged except the documented addition
of the three missing declared capitals Q, X, and Y to the final lesson.

The upstream file attributes its generator to Steinar Theigmann and Håvard
Frøiland but has no file-level SPDX identifier. The repository includes
GPL-2.0-or-later, whose text is preserved with the source. This notice does not
pretend the missing file-level mapping is resolved: legal/provenance sign-off
remains a production-release gate.
