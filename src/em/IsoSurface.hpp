

#pragma once

#include <stdint.h>
#include <vector>

#include "include/linalg/linalg.h"

using namespace linalg::aliases;

template <typename> class Volume;
using Volume16 = Volume<uint16_t>;

class IsoSurface {
public:

    //Build isosurface from given volume and iso-level
    bool build(const Volume16* vol, uint16_t iso);

    //Get number of vertices (position and normal arrays guaranteed to be same length)
    size_t getVertexCount() const {
        return mPosition.size();
    }

    //Get number of indices (will always be multiple of 3)
    size_t getIndexCount() const {
        return mIndices.size();
    }

    //Get pointer to position data
    const float3* getPositionData() {
        return &mPosition[0];
    }
    //Get pointer to normal data
    const float3* getNormalData() {
        return &mNormal[0];
    }
    //Get pointer to index data
    const uint32_t* getIndexData() {
        return &mIndices[0];
    }

private:

    //Array of 3D positions
    std::vector<float3> mPosition;
    //Array of 3D normals
    std::vector<float3> mNormal;
    //Array of 32-bit triangle indices
    std::vector<uint32_t> mIndices;

};

