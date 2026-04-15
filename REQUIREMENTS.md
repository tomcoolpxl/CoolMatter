# Requirements

## Project title

CoolMatter

## Purpose

Build a small 3D application for personal experimentation with scientifically grounded visualizations of the hydrogen atom.

The first implementation is not intended primarily for teaching, outreach, or portfolio presentation. The primary goal is to support careful exploration of hydrogen stationary states while keeping the displayed data tied to a defined quantum-mechanical model.

## Product goals

The project must:

* visualize hydrogen stationary states in 3D
* make the displayed quantity scientifically explicit
* keep the physics/model layer separate from rendering choices
* remain small enough to iterate quickly
* establish a code foundation that can later support more states, better rendering, and eventually proton-related exploration

The project must not:

* drift into decorative or undefined particle clouds
* imply unsupported proton structure in version 1
* hide important approximations from the user

## Version scope overview

### Version 1

Version 1 includes:

* Vite + JavaScript + Three.js application
* black background and minimal scene composition
* orbit-based camera controls with zoom
* hydrogen nucleus at the origin
* hydrogen 1s and 2s stationary eigenstates
* authoritative underlying quantity `rho(x, y, z) = |psi_nlm(x, y, z)|^2`
* Monte Carlo point-sampling visualization derived from `|psi|^2`
* minimal control panel
* nucleus scale toggle between physical and visually enlarged display modes
* scientific validation checks implemented alongside the rendering code

### Version 1.5

Version 1.5 should add:

* 2p orbitals
* scalar-field generation from the same underlying `|psi|^2` model
* isosurface rendering derived from that scalar field
* better diagnostics for nodal structure and sampling quality

### Version 2

Version 2 may add:

* more hydrogen eigenstates
* controlled superpositions
* time dependence where physically justified
* volumetric rendering experiments
* more advanced atomic-core handling
* later proton-related exploration in a clearly separate mode

## Scientific model

### Governing model

Version 1 must use the standard nonrelativistic Schrödinger model for the hydrogen atom with stationary bound-state solutions.

Assumptions for version 1:

* single electron hydrogen atom
* stationary eigenstates only
* fixed nucleus at the origin
* no external electromagnetic fields
* no spin visualization
* no relativistic corrections
* no fine structure, hyperfine structure, Lamb shift, or QED corrections
* no time-dependent perturbations

These assumptions are intentional for version 1. They define a strict but manageable baseline rather than a full precision-hydrogen model.

### State representation

Each implemented state must be identified by the quantum numbers:

* principal quantum number `n`
* orbital angular momentum quantum number `l`
* magnetic quantum number `m`

The model layer must represent hydrogen states as separable solutions in spherical coordinates:

`psi_nlm(r, theta, phi) = R_nl(r) Y_l^m(theta, phi)`

The rendering layer must not invent geometry independent of this state definition.

### Authoritative physical quantity

The authoritative quantity for version 1 is the spatial probability density

`rho(x, y, z) = |psi_nlm(x, y, z)|^2`

This is the quantity from which all version 1 visual output must be derived.

The implementation must clearly distinguish:

* spatial probability density `|psi|^2`
* radial probability distribution
* sampled measurement outcomes drawn from `|psi|^2`
* isosurfaces derived from a scalar density field

No visualization mode may describe itself ambiguously as an electron cloud without declaring which of these it represents.

## Coordinate conventions and units

### Coordinate conventions

The model layer should use spherical coordinates where appropriate:

* `r` for radial distance
* `theta` for polar angle
* `phi` for azimuthal angle

The rendering layer should use Cartesian coordinates:

* `x`
* `y`
* `z`

Required conversion responsibility:

* state evaluation and probability definitions belong to the model layer
* spherical-to-Cartesian conversion belongs to the sampling or field-generation layer
* Three.js receives Cartesian positions only

### Units

Internal scientific computation should use atomic units where practical, with the Bohr radius `a0` as the natural length scale.

Requirements:

* internal length unit: `a0`
* any displayed physical length labels, if added later, must state units explicitly
* any conversion to SI units must be isolated in utility code

The code and documentation must state clearly that rendering coordinates are expressed in units of `a0` unless otherwise noted.

## Rendering semantics

### Version 1 rendering method

Version 1 must render hydrogen orbitals using Monte Carlo samples drawn from the spatial probability density `|psi|^2`.

Interpretation:

* each rendered point represents one sample drawn from the probability distribution
* the cloud is therefore a visualization of sampled detection outcomes, not a literal continuous material cloud
* denser regions in the point set should correspond statistically to larger values of `|psi|^2`

### Rendering constraints

The rendering method may be visually approximate, but its data source must remain physically defined.

Version 1 constraints:

* no arbitrary fog volume generated without reference to `|psi|^2`
* no hand-authored orbital meshes
* no opacity mapping that implies a different physical quantity than the one documented
* any finite truncation radius used for practical computation must be explicit and configurable in code

### Planned later rendering methods

The architecture must preserve support for later rendering methods derived from the same underlying quantity, including:

* scalar fields sampled on a grid
* isosurfaces of constant density
* volumetric rendering

These later methods must not require changing the scientific definition of the state.

## State support requirements

### Version 1 required states

Version 1 must support:

* `1s`
* `2s`

### Version 1.5 required states

Version 1.5 should support:

* `2p` states

The code must be structured so that adding later hydrogen bound states is routine rather than architectural.

## Nucleus representation

### Role of the nucleus in version 1

The nucleus in version 1 is a positional reference and atomic center marker only.

It must:

* remain visually distinct from the electron samples
* avoid suggesting internal proton structure
* remain clearly documented as a simplified display object

### Nucleus scale modes

The viewer must support two nucleus display modes:

* physically scaled mode
* visually enlarged reference mode

Requirements:

* physically scaled mode must preserve the intended relative scaling logic of the scene
* visually enlarged mode must improve visibility and orientation
* the UI must make it obvious when the nucleus is not shown to scale
* switching nucleus display mode must not alter the electron distribution data

## Camera and interaction requirements

### Required interaction model

The viewer must support:

* orbit-style mouse interaction
* zoom via wheel or trackpad
* camera reset

Version 1 defaults:

* orbit control is the default interaction mode
* free-fly movement is excluded from version 1
* panning is optional and should only be enabled if it does not compromise spatial interpretation

### Interaction quality requirements

Camera behavior must be:

* stable
* predictable
* free of excessive drift
* suitable for close inspection and zoomed-out inspection

## Visual requirements

### Scene style

The scene must remain minimal.

Required baseline:

* black background
* sparse lighting only where lighting is needed for visible depth cues
* non-distracting presentation
* no decorative visual effects that obscure interpretation

### Use of transparency and blending

Transparency, point sprites, and blending may be used only if their effect is consistent with the declared rendering interpretation.

The implementation must avoid producing an attractive but scientifically ambiguous haze.

## Control panel requirements

Version 1 must include a small control panel that does not dominate the viewport.

Required controls:

* state selection between supported states
* sample count or sampling density
* point size
* opacity
* nucleus scale mode
* camera reset

Preferred additional control:

* reproducible random seed or seed reset

Version 1 should avoid expanding the panel into a large diagnostics dashboard.

## Sampling requirements

### Sampling definition

Version 1 sampling must draw positions from the spatial probability density `|psi|^2` for the selected state.

Sampling requirements:

* the sampled distribution must be statistically consistent with the selected hydrogen state
* the implementation must support reproducible sampling through a deterministic seed
* the code must separate random-number generation from state evaluation and rendering

### Truncation and domain handling

Because bound-state wavefunctions have infinite spatial support, version 1 will necessarily use a practical computational cutoff.

Requirements:

* any truncation radius must be explicit in code
* truncation strategy must be documented
* validation must show that the chosen truncation does not materially distort the intended result for the chosen sample count and state

## Validation requirements

The project must include a validation path that can be run independently of interactive rendering.

### Required validation goals

The codebase must make it possible to verify:

* normalization of implemented wavefunctions
* correctness of sampling against expected distributions
* nodal structure for each implemented state
* separation between spatial probability density and radial probability distribution

### Required version 1 validation checks

Version 1 must include the following checks:

* numerical normalization check for each implemented state
* deterministic sampling run using a fixed seed
* radial histogram comparison against the expected radial probability distribution
* state-specific node checks
* a check that 1s has maximum spatial probability density at `r = 0`
* a check that the corresponding radial probability distribution peaks at nonzero radius
* a check that 2s exhibits the expected radial node structure

### Validation implementation requirements

The validation tooling must:

* be independent from Three.js rendering code
* produce machine-readable summaries or logs
* be simple enough to rerun during development

Preferred outputs:

* numeric summary in console or file output
* simple plots later if helpful

## Performance requirements

Version 1 should remain interactive on a typical modern desktop browser.

Performance requirements:

* stable interactive camera movement
* reasonable initial sample generation time
* adjustable sample count for lighter or heavier inspection

The project does not require a hard real-time frame-rate guarantee in version 1, but it must remain practically usable during experimentation.

## Code architecture requirements

The codebase must be split into clearly separated layers.

Required layers:

* application bootstrap and scene lifecycle
* hydrogen state mathematics
* sampling and field generation
* rendering primitives and materials
* UI controls and state management
* validation utilities

### Separation rules

The following separations are mandatory:

* physics formulas must not be embedded directly into rendering classes
* sampling logic must not depend on UI widgets
* validation code must not depend on Three.js scene objects
* nucleus display scaling must not alter the physical model

## Documentation requirements

The repository must include documentation that states:

* the scientific assumptions used in version 1
* the exact quantity being visualized
* what the point cloud means physically
* what is shown to scale and what is not
* which items are deferred to later versions

## Explicit non-requirements for version 1

Version 1 does not need:

* proton internal structure
* quark visualization
* gluon visualization
* teaching overlays
* labels in the 3D scene
* animation of the electron distribution
* superpositions
* time dependence
* relativistic or QED precision corrections

## Risks and design cautions

The implementation must actively avoid the following mistakes:

* confusing `|psi|^2` with radial probability
* producing a cloud whose appearance depends mainly on rendering artifacts rather than the distribution
* choosing a truncation radius silently
* enlarging the nucleus without making that visible in the UI
* writing code that makes later state additions difficult

## Acceptance criteria for version 1

Version 1 is acceptable only when all of the following are true:

* the application runs locally using Vite and Three.js
* the camera can orbit and zoom reliably
* the scene shows a nucleus marker at the origin
* the viewer supports `1s` and `2s`
* rendered points are generated from a documented `|psi_nlm|^2` model
* the UI exposes the required small set of controls
* the nucleus scale toggle works and clearly distinguishes physical and enlarged display modes
* validation checks exist and pass for implemented states
* the codebase is cleanly separated into model, sampling, rendering, UI, and validation concerns

## Deferred items for later documents

The following should be specified later, not in this requirements document:

* detailed scene composition decisions
* exact file and folder structure
* precise rendering material choices
* UI layout details
* naming conventions for implementation files
* proton-mode design

Those belong in the design document rather than the requirements document.
