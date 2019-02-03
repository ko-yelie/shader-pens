float saturate(float a) {
  return clamp(a, 0., 1.);
}

#pragma glslify: export(saturate)
