#include "main.hpp"
#include "IsoSurface.hpp"
#include "Volume.hpp"


EM_EXPORT size_t getVolumeSizeBytes(const  Volume16*vol) {

    return vol->getSizeBytes();
}

EM_EXPORT IsoSurface* createIsoSurface() {

    IsoSurface *isoSurface = new IsoSurface();
    return isoSurface;
}

EM_EXPORT bool buildIsoSurface(IsoSurface* isoSurface, const Volume16* vol, uint16_t iso) {

    return isoSurface->build(vol,iso);

}


EM_EXPORT uint16_t* getVolumeData(Volume16* vol) {

    return vol->getDataPointer();
}



EM_EXPORT const float* getIsoSurfacePosition(IsoSurface* isoSurface) {
    return (const float*) isoSurface->getPositionData();
}

EM_EXPORT const float* getIsoSurfaceNormal(IsoSurface* isoSurface) {
    return (const float*) isoSurface->getNormalData();
}
EM_EXPORT size_t getIsoSurfaceVertexCount(IsoSurface *isoSurface) {
    return isoSurface->getIndexCount();
}

EM_EXPORT const uint32_t* getIsoSurfaceIndices(IsoSurface *isoSurface) {
    return isoSurface->getIndexData();
}
EM_EXPORT size_t getIsoSurfaceIndexCount(IsoSurface *isoSurface) {
    return isoSurface->getIndexCount();
}

EM_EXPORT Volume16* createVolume(uint32_t w, uint32_t h, uint32_t d) {
    return new Volume16(w,h,d);
}