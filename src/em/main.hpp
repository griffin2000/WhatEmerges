

#include <iostream>
#if EMSCRIPTEN
#include <emscripten.h>
#define EM_EXPORT EMSCRIPTEN_KEEPALIVE extern "C"
#else
#define EM_EXPORT extern "C"
#endif


template <typename> class Volume;
using Volume16 = Volume<uint16_t>;
class IsoSurface;

EM_EXPORT size_t getVolumeSizeBytes(const  Volume16* vol);

EM_EXPORT bool buildIsoSurface(IsoSurface* isoSurface, const Volume16* vol, uint16_t iso);
EM_EXPORT IsoSurface* createIsoSurface();


EM_EXPORT const float* getIsoSurfacePosition(IsoSurface* isoSurface);
EM_EXPORT const float* getIsoSurfaceNormal(IsoSurface* isoSurface);

EM_EXPORT Volume16* createVolume(uint32_t w, uint32_t h, uint32_t d); 
EM_EXPORT uint16_t* getVolumeData(Volume16* vol);
