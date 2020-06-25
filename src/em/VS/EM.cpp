
// Simple native test of emscripten interface

#include <iostream>
#include "../main.hpp"
#include "../IsoSurface.hpp"

using namespace linalg::aliases;


// high_resolution_clock example
#include <iostream>
#include <ctime>
#include <ratio>
#include <chrono>

int main()
{
	using namespace std::chrono;

	int w = 256;
	int h = 256;
	int d = 256;
	Volume16* vol = createVolume(w, h, d);
	uint16_t* data = getVolumeData(vol);

	float3 v;
	float3 midpnt((float)w * 0.5f, (float)h * 0.5f, (float)d * 0.5f);
	int idx = 0;
	for (int i = 0; i < d; i++) {
		for (int j = 0; j < h; j++) {
			for (int k = 0; k < w; k++) {
				v = float3((float)i, (float)j, (float)k);
				float3 d = v - midpnt;
				float dist = length(d)/length(midpnt);
				data[idx++] = (uint16_t)(0xffff * dist);

			}
		}
	}
	high_resolution_clock::time_point t1 = high_resolution_clock::now();

	IsoSurface *iso = createIsoSurface();

	buildIsoSurface(iso, vol, 32767);

	high_resolution_clock::time_point t2 = high_resolution_clock::now();

	duration<double> time_span = duration_cast<duration<double>>(t2 - t1);
	std::cout << time_span.count() << std::endl;
	std::cout << iso->getVertexCount() << " verts generated" << std::endl;
}
