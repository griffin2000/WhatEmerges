
/// The main emscripten C interface to C++ iso surface code

#include "main.hpp"
#include "IsoSurface.hpp"
#include "Volume.hpp"


//Get volume size in bytes
EM_EXPORT size_t getVolumeSizeBytes(const  Volume16*vol) {

    return vol->getSizeBytes();
}

//Create a new iso surface
EM_EXPORT IsoSurface* createIsoSurface() {

    IsoSurface *isoSurface = new IsoSurface();
    return isoSurface;
}

//Build a iso surface from volume
EM_EXPORT bool buildIsoSurface(IsoSurface* isoSurface, const Volume16* vol, uint16_t iso) {

    return isoSurface->build(vol,iso);

}

//Get volume data pointer
EM_EXPORT uint16_t* getVolumeData(Volume16* vol) {

    return vol->getDataPointer();
}


//Get pointer to position data (cast to float as no knowlege of float on JS side)
EM_EXPORT const float* getIsoSurfacePosition(IsoSurface* isoSurface) {
    return (const float*) isoSurface->getPositionData();
}

//Get pointer to normal data (cast to float as no knowlege of float on JS side)
EM_EXPORT const float* getIsoSurfaceNormal(IsoSurface* isoSurface) {
    return (const float*) isoSurface->getNormalData();
}

//Get pointer to normal data (cast to float as no knowlege of float on JS side)
EM_EXPORT size_t getIsoSurfaceVertexCount(IsoSurface *isoSurface) {
    return isoSurface->getIndexCount();
}

//Get pointer to index data 
EM_EXPORT const uint32_t* getIsoSurfaceIndices(IsoSurface *isoSurface) {
    return isoSurface->getIndexData();
}

//Get index count
EM_EXPORT size_t getIsoSurfaceIndexCount(IsoSurface *isoSurface) {
    return isoSurface->getIndexCount();
}

//Create a volume with given dimensions
EM_EXPORT Volume16* createVolume(uint32_t w, uint32_t h, uint32_t d) {
    return new Volume16(w,h,d);
}