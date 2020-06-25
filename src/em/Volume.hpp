#pragma once

#include <stdint.h>

//3D array of volume data
template<typename VolumeDataType=uint16_t>
class Volume {
public:
    Volume(uint32_t w, uint32_t h, uint32_t d) {
        mDimX = w;
        mDimY = h;
        mDimZ = d;
        data.resize(w*h*d);
    }

    // Get size in bytes
    size_t getSizeBytes() const {
        return data.size() * sizeof(VolumeDataType);
    }

    // Get a pointer to the raw data
    VolumeDataType* getDataPointer() {
        return &data[0];
    }
    const VolumeDataType* getDataPointer() const {
        return &data[0];
    }
    
    // Get the width (x dimension of volume)
    uint32_t getWidth() const {
        return mDimX;
    }
    
    // Get the height (x dimension of volume)
    uint32_t getHeight() const {
        return mDimY;
    }
    
    // Get the depth (x dimension of volume)
    uint32_t getDepth() const {
        return mDimZ;
    }

private:
    //Dimensions of volume
    uint32_t mDimX;
    uint32_t mDimY;
    uint32_t mDimZ;
    //The actual data for the volume
    std::vector<VolumeDataType> data;
};

using Volume16 = Volume<uint16_t>;
using Volume8 = Volume<uint8_t>;
